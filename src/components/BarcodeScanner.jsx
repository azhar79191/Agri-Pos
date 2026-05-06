import React, { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Scan, Camera, Keyboard, AlertCircle, Package, XCircle, CheckCircle, RefreshCw, ZapOff } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";
import { formatCurrency } from "../utils/helpers";

/* ── Beep ── */
const beep = (ok = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (ok) {
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.25);
    } else {
      o.type = "sawtooth";
      o.frequency.setValueAtTime(180, ctx.currentTime);
      g.gain.setValueAtTime(0.35, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    }
    o.onended = () => ctx.close();
  } catch {}
};

/* ── Scan line animation ── */
const ScanLine = () => (
  <>
    <style>{`
      @keyframes sweep {
        0%   { top: 2px; }
        50%  { top: calc(100% - 2px); }
        100% { top: 2px; }
      }
      .sweep-line {
        position: absolute; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #10b981 30%, #34d399 50%, #10b981 70%, transparent);
        box-shadow: 0 0 10px 3px rgba(16,185,129,0.8);
        animation: sweep 2s ease-in-out infinite;
      }
    `}</style>
    <div className="sweep-line" />
  </>
);

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const [mode, setMode]           = useState("camera");
  const [manual, setManual]       = useState("");
  const [camErr, setCamErr]       = useState("");
  const [scanning, setScanning]   = useState(false);
  const [result, setResult]       = useState(null);   // { barcode, product, added }
  const [flash, setFlash]         = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const readerRef  = useRef(null);
  const lastRef    = useRef("");
  const inputRef   = useRef(null);
  const prodsRef   = useRef(products);
  useEffect(() => { prodsRef.current = products; }, [products]);

  /* ── Stop everything ── */
  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  /* ── Process decoded barcode ── */
  const processBarcode = useCallback((raw) => {
    const code = raw.trim();
    if (!code || code === lastRef.current) return;
    lastRef.current = code;
    setTimeout(() => { lastRef.current = ""; }, 4000);

    const product = prodsRef.current.find(p => p.barcode && p.barcode.trim() === code);

    setFlash(true);
    setTimeout(() => setFlash(false), 350);

    if (product) {
      beep(true);
      onScan(product);
      stopAll();
      setResult({ barcode: code, product, added: true });
      setStatusMsg(`Added: ${product.name}`);
    } else {
      beep(false);
      stopAll();
      setResult({ barcode: code, product: null, added: false });
      setStatusMsg(`No product found for barcode: ${code}`);
    }
  }, [stopAll, onScan]);

  /* ── Decode one video frame using @zxing/library directly on canvas ── */
  const decodeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || video.paused) {
      rafRef.current = requestAnimationFrame(decodeFrame);
      return;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) { rafRef.current = requestAnimationFrame(decodeFrame); return; }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      const luminance = new Uint8ClampedArray(w * h);
      for (let i = 0; i < w * h; i++) {
        const r = imageData.data[i * 4];
        const g = imageData.data[i * 4 + 1];
        const b = imageData.data[i * 4 + 2];
        luminance[i] = (r * 299 + g * 587 + b * 114) / 1000;
      }
      const source = {
        getWidth: () => w,
        getHeight: () => h,
        getRow: (y, row) => {
          const start = y * w;
          for (let i = 0; i < w; i++) row[i] = luminance[start + i];
          return row;
        },
        getMatrix: () => luminance,
        isCropSupported: () => false,
        renderThumbnail: () => {},
        crop: () => { throw new Error("crop not supported"); },
        rotateCounterClockwise: () => { throw new Error("rotate not supported"); },
        rotateCounterClockwise45: () => { throw new Error("rotate not supported"); },
        isRotateSupported: () => false,
        invert: () => { throw new Error("invert not supported"); },
      };
      const decoded = readerRef.current.decode(source);
      if (decoded) { processBarcode(decoded.getText()); return; }
    } catch (e) {
      if (!(e instanceof NotFoundException)) console.warn("[scan]", e?.message);
    }

    rafRef.current = requestAnimationFrame(decodeFrame);
  }, [processBarcode]);

  /* ── Start camera ── */
  const startCamera = useCallback(async () => {
    setCamErr("");
    setResult(null);
    setStatusMsg("Starting camera...");
    setFlash(false);

    // Init zxing reader with all formats
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
      BarcodeFormat.ITF, BarcodeFormat.CODABAR, BarcodeFormat.DATA_MATRIX,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    readerRef.current = new BrowserMultiFormatReader(hints);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("muted", "true");

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = reject;
        setTimeout(reject, 8000); // 8s timeout
      });

      setScanning(true);
      setStatusMsg("Point camera at barcode");
      rafRef.current = requestAnimationFrame(decodeFrame);

    } catch (err) {
      setScanning(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCamErr("Camera permission denied. Please allow camera access in your browser settings, then try again.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCamErr("No camera found on this device. Use manual barcode entry instead.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCamErr("Camera is in use by another app. Close it and try again.");
      } else if (err.name === "OverconstrainedError") {
        // Retry without ideal constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          const video = videoRef.current;
          video.srcObject = stream;
          video.setAttribute("playsinline", "true");
          await new Promise(r => { video.onloadedmetadata = () => video.play().then(r); });
          setScanning(true);
          setStatusMsg("Point camera at barcode");
          rafRef.current = requestAnimationFrame(decodeFrame);
        } catch (e2) {
          setCamErr(`Camera error: ${e2.message}`);
        }
      } else {
        setCamErr(`Camera error: ${err.message || err.name}`);
      }
    }
  }, [decodeFrame]);

  /* ── Lifecycle ── */
  useEffect(() => {
    if (isOpen && mode === "camera" && !result) {
      const t = setTimeout(startCamera, 200);
      return () => { clearTimeout(t); stopAll(); };
    }
    if (!isOpen) stopAll();
  }, [isOpen, mode, result]); // eslint-disable-line

  useEffect(() => {
    if (isOpen && mode === "manual") setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, mode]);

  const handleScanAgain = () => {
    setResult(null);
    setStatusMsg("");
    lastRef.current = "";
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manual.trim()) { processBarcode(manual.trim()); setManual(""); }
  };

  const handleClose = () => {
    stopAll();
    setResult(null);
    setCamErr("");
    setManual("");
    setFlash(false);
    setStatusMsg("");
    onClose();
  };

  return (
    <ModernModal isOpen={isOpen} onClose={handleClose} title="Barcode Scanner" subtitle="Scan to add product to cart instantly" size="md" icon={Scan} iconColor="emerald">
      <div className="space-y-4">

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[{ id: "camera", icon: Camera, label: "Camera" }, { id: "manual", icon: Keyboard, label: "Manual" }].map(({ id, icon: Icon, label }) => (
            <button key={id}
              onClick={() => { setMode(id); setResult(null); setCamErr(""); setStatusMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === id ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Result panel */}
        {result && (
          <div className={`rounded-xl border-2 p-4 ${result.product ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/15" : "border-red-400 bg-red-50 dark:bg-red-900/20"}`}>
            <div className="flex items-start gap-3">
              {result.product
                ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1 tracking-wider">{result.barcode}</p>
                {result.product ? (
                  <>
                    <p className="font-bold text-gray-900 dark:text-white text-base">{result.product.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-emerald-600 font-bold text-sm">{formatCurrency(result.product.price, "Rs.")}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${result.product.stock <= 0 ? "bg-red-100 text-red-600" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                        Stock: {result.product.stock} {result.product.unit}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Added to cart!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-red-700 dark:text-red-400">Product Not Found</p>
                    <p className="text-xs text-red-500 mt-0.5">No product with barcode <span className="font-mono font-bold">{result.barcode}</span> is registered in this shop.</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <ModernButton variant="outline" className="flex-1" icon={RefreshCw} onClick={handleScanAgain}>Scan Again</ModernButton>
              {result.added && <ModernButton variant="primary" className="flex-1" icon={Package} onClick={handleClose}>Done</ModernButton>}
            </div>
          </div>
        )}

        {/* Camera view */}
        {mode === "camera" && !result && (
          <div className="space-y-3">
            {camErr ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <ZapOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">Camera Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{camErr}</p>
                  <button onClick={startCamera} className="mt-2 text-xs font-bold text-red-600 underline">Try again</button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                {/* Hidden canvas for frame decoding */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Live video */}
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 100%)" }} />

                {/* Scan frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative" style={{ width: "75%", height: "40%" }}>
                    {/* Corner brackets */}
                    <span className={`absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-sm transition-colors ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-sm transition-colors ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-sm transition-colors ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-sm transition-colors ${flash ? "border-white" : "border-emerald-400"}`} />
                    {/* Sweep line */}
                    {scanning && !flash && <ScanLine />}
                    {/* Flash overlay */}
                    {flash && <div className="absolute inset-0 bg-emerald-400/40 rounded-sm" />}
                  </div>
                </div>

                {/* Status */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                  {scanning ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-emerald-400 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {statusMsg || "Point camera at barcode"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-slate-300 text-xs rounded-full">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      {statusMsg || "Starting camera..."}
                    </span>
                  )}
                </div>
              </div>
            )}
            {!camErr && <p className="text-xs text-center text-slate-400">Product is added to cart automatically when barcode is detected</p>}
          </div>
        )}

        {/* Manual entry */}
        {mode === "manual" && !result && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Enter Barcode</label>
              <input ref={inputRef} type="text" value={manual} onChange={e => setManual(e.target.value)}
                placeholder="Type or scan barcode..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-mono tracking-widest outline-none"
                autoFocus />
            </div>
            <ModernButton type="submit" variant="primary" className="w-full" disabled={!manual.trim()} icon={Scan}>
              Search and Add to Cart
            </ModernButton>
            {products.filter(p => p.barcode).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Products with barcodes:</p>
                <div className="flex flex-wrap gap-2">
                  {products.filter(p => p.barcode).slice(0, 8).map(p => (
                    <button key={p._id || p.id} type="button" onClick={() => processBarcode(p.barcode)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors">
                      {p.barcode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </ModernModal>
  );
};

export default BarcodeScanner;
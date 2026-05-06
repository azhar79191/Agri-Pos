import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Scan, Camera, Keyboard, XCircle, CheckCircle,
  RefreshCw, Package, ZapOff, AlertCircle,
} from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";
import { formatCurrency } from "../utils/helpers";
import { getProductByBarcode } from "../api/productApi";

/* ─── Beep via Web Audio API ─── */
const beep = (success = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (success) {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
    osc.onended = () => ctx.close();
  } catch (_) { /* AudioContext unavailable */ }
};

/* ─── Animated sweep line ─── */
const ScanLine = () => (
  <>
    <style>{`
      @keyframes bcsweep {
        0%   { top: 2px; }
        50%  { top: calc(100% - 2px); }
        100% { top: 2px; }
      }
      .bc-sweep {
        position: absolute; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent 0%, #10b981 30%, #34d399 50%, #10b981 70%, transparent 100%);
        box-shadow: 0 0 10px 3px rgba(16,185,129,0.9);
        animation: bcsweep 1.6s ease-in-out infinite;
      }
    `}</style>
    <div className="bc-sweep" />
  </>
);

/* ─── Main component ─── */
const BarcodeScanner = ({ isOpen, onClose, onScan, products, useApi = false }) => {
  const [mode, setMode]       = useState("camera");
  const [manual, setManual]   = useState("");
  const [camErr, setCamErr]   = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult]   = useState(null);
  const [flash, setFlash]     = useState(false);
  const [status, setStatus]   = useState("");
  const [detectorSupported, setDetectorSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef("");
  const inputRef  = useRef(null);
  const prodsRef  = useRef(products);

  useEffect(() => { prodsRef.current = products; }, [products]);

  // Check if BarcodeDetector is supported
  useEffect(() => {
    if ("BarcodeDetector" in window) {
      setDetectorSupported(true);
    }
  }, []);

  /* ── Stop camera + RAF loop ── */
  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  /* ── Process a decoded barcode string ── */
  const processBarcode = useCallback(async (raw) => {
    const code = raw.trim();
    if (!code || code === lastRef.current) return;
    lastRef.current = code;
    setTimeout(() => { lastRef.current = ""; }, 4000);

    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    stopAll();

    let product = null;

    // Try API lookup first if enabled
    if (useApi) {
      try {
        setLoading(true);
        const response = await getProductByBarcode(code);
        product = response.data.data.product;
      } catch (err) {
        console.warn("API barcode lookup failed:", err.message);
        // Fall back to local search
      } finally {
        setLoading(false);
      }
    }

    // Fall back to local search if API disabled or failed
    if (!product && prodsRef.current) {
      product = prodsRef.current.find(p => {
        if (!p.barcode) return false;
        const pb = p.barcode.trim();
        return pb === code ||
               pb.toLowerCase() === code.toLowerCase() ||
               pb.replace(/\s/g, "") === code.replace(/\s/g, "");
      });
    }

    if (product) {
      beep(true);
      onScan(product);
      setResult({ barcode: code, product, added: true });
    } else {
      beep(false);
      setResult({ barcode: code, product: null, added: false });
    }
  }, [stopAll, onScan, useApi]);

  /* ── Decode using native BarcodeDetector API ── */
  const detectBarcode = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.paused || video.ended) {
      rafRef.current = requestAnimationFrame(detectBarcode);
      return;
    }

    try {
      const barcodeDetector = new window.BarcodeDetector({
        formats: [
          "code_128", "code_39", "code_93",
          "ean_13", "ean_8", "upc_a", "upc_e",
          "qr_code", "data_matrix", "itf", "codabar"
        ]
      });

      const barcodes = await barcodeDetector.detect(video);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0];
        processBarcode(barcode.rawValue);
        return; // Stop scanning
      }
    } catch (err) {
      // Detection failed, continue scanning
      if (err.name !== "NotSupportedError") {
        console.warn("[BarcodeDetector]", err.message);
      }
    }

    rafRef.current = requestAnimationFrame(detectBarcode);
  }, [processBarcode]);

  /* ── Start camera stream ── */
  const startCamera = useCallback(async () => {
    setCamErr("");
    setResult(null);
    setFlash(false);
    setStatus("Starting camera...");

    if (!detectorSupported) {
      setCamErr("BarcodeDetector API not supported in this browser. Use Android Chrome or Manual entry.");
      return;
    }

    try {
      // Request rear camera with good resolution
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width:  { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });
      } catch (_) {
        // Fallback: any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video start timeout")), 10000);
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          video.play().then(resolve).catch(reject);
        };
        video.onerror = (e) => { clearTimeout(timeout); reject(e); };
      });

      setScanning(true);
      setStatus("Point camera at barcode");
      rafRef.current = requestAnimationFrame(detectBarcode);

    } catch (err) {
      setScanning(false);
      const name = err.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCamErr("Camera permission denied. Tap the camera icon in your browser address bar and allow access, then tap 'Try again'.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCamErr("No camera found. Use Manual entry to type the barcode.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setCamErr("Camera is busy (used by another app). Close other apps and tap 'Try again'.");
      } else {
        setCamErr(`Camera failed: ${err.message || name}. Try Manual entry.`);
      }
    }
  }, [detectBarcode, detectorSupported]);

  /* ── Lifecycle ── */
  useEffect(() => {
    if (isOpen && mode === "camera" && !result) {
      const t = setTimeout(startCamera, 250);
      return () => { clearTimeout(t); stopAll(); };
    }
    if (!isOpen) stopAll();
  }, [isOpen, mode, result]); // eslint-disable-line

  useEffect(() => {
    if (isOpen && mode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, mode]);

  const handleScanAgain = () => {
    setResult(null);
    setStatus("");
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
    setStatus("");
    onClose();
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Barcode Scanner"
      subtitle="Scan barcode — product added to cart automatically"
      size="md"
      icon={Scan}
      iconColor="emerald"
    >
      <div className="space-y-4">

        {/* BarcodeDetector API Warning */}
        {!detectorSupported && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-semibold">Camera scanning not available</p>
              <p className="mt-0.5">
                BarcodeDetector API is only supported in Android Chrome. Use Manual entry or update your browser.
              </p>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[
            { id: "camera", icon: Camera,   label: "Camera" },
            { id: "manual", icon: Keyboard, label: "Manual" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setResult(null); setCamErr(""); setStatus(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === id
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── Result panel ── */}
        {result && (
          <div className={`rounded-xl border-2 p-4 ${
            result.product
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/15"
              : "border-red-400 bg-red-50 dark:bg-red-900/20"
          }`}>
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Looking up barcode...</span>
              </div>
            )}
            {!loading && (
              <>
                <div className="flex items-start gap-3">
                  {result.product
                    ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <XCircle    className="w-6 h-6 text-red-500    flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
                      {result.barcode}
                    </p>
                    {result.product ? (
                      <>
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                          {result.product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            {formatCurrency(result.product.price, "Rs.")}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            (result.product.stock ?? 1) <= 0
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                            Stock: {result.product.stock ?? "?"} {result.product.unit}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Added to cart!
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-red-700 dark:text-red-400">Product Not Found</p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                          Scanner read: <span className="font-mono font-bold">{result.barcode}</span>
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          This barcode is not in your products. Go to Products → edit the product → set barcode to exactly: <span className="font-mono font-bold">{result.barcode}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <ModernButton variant="outline" className="flex-1" icon={RefreshCw} onClick={handleScanAgain}>
                    Scan Again
                  </ModernButton>
                  {result.added && (
                    <ModernButton variant="primary" className="flex-1" icon={Package} onClick={handleClose}>
                      Done
                    </ModernButton>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Camera view ── */}
        {mode === "camera" && !result && (
          <div className="space-y-3">
            {camErr ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <ZapOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">Camera Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">{camErr}</p>
                  <button
                    onClick={startCamera}
                    className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                {/* Live video feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />

                {/* Dark vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, rgba(0,0,0,0.6) 100%)",
                  }}
                />

                {/* Scan target frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative" style={{ width: "78%", height: "42%" }}>
                    {/* Corner brackets — flash white on detection */}
                    <span className={`absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-sm transition-colors duration-150 ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-sm transition-colors duration-150 ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-sm transition-colors duration-150 ${flash ? "border-white" : "border-emerald-400"}`} />
                    <span className={`absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-sm transition-colors duration-150 ${flash ? "border-white" : "border-emerald-400"}`} />

                    {/* Animated sweep line */}
                    {scanning && !flash && <ScanLine />}

                    {/* Green flash on successful decode */}
                    {flash && (
                      <div className="absolute inset-0 bg-emerald-400/35 rounded-sm" />
                    )}
                  </div>
                </div>

                {/* Status pill */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                  {scanning ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-emerald-400 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {status || "Point camera at barcode"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-slate-300 text-xs rounded-full">
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      {status || "Starting camera..."}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!camErr && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                Hold barcode steady inside the frame — added to cart automatically
              </p>
            )}
          </div>
        )}

        {/* ── Manual entry ── */}
        {mode === "manual" && !result && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enter Barcode
              </label>
              <input
                ref={inputRef}
                type="text"
                value={manual}
                onChange={e => setManual(e.target.value)}
                placeholder="Type or paste barcode..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-mono tracking-widest outline-none"
                autoFocus
              />
            </div>
            <ModernButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!manual.trim()}
              icon={Scan}
            >
              Search and Add to Cart
            </ModernButton>

            {/* Quick-select from registered products */}
            {products.filter(p => p.barcode).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Products with barcodes ({products.filter(p => p.barcode).length}):
                </p>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {products.filter(p => p.barcode).map(p => (
                    <button
                      key={p._id || p.id}
                      type="button"
                      onClick={() => processBarcode(p.barcode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <span className="font-mono">{p.barcode}</span>
                      <span className="text-gray-400 dark:text-gray-500">·</span>
                      <span className="truncate max-w-[80px]">{p.name}</span>
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

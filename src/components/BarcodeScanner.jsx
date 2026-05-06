import React, { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Scan, Camera, Keyboard, AlertCircle, Package, XCircle, CheckCircle, RefreshCw } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";
import { formatCurrency } from "../utils/helpers";

/* ── Beep via Web Audio API ── */
const playBeep = (success = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (success) {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
    osc.onended = () => ctx.close();
  } catch {}
};

/* ── Animated scan line ── */
const ScanLine = () => (
  <>
    <style>{`
      @keyframes scan-sweep {
        0%   { top: 4px; opacity: 1; }
        48%  { top: calc(100% - 4px); opacity: 1; }
        50%  { top: calc(100% - 4px); opacity: 0.4; }
        52%  { top: calc(100% - 4px); opacity: 1; }
        100% { top: 4px; opacity: 1; }
      }
      .scan-line {
        position: absolute; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent 0%, #34d399 20%, #10b981 50%, #34d399 80%, transparent 100%);
        box-shadow: 0 0 8px 2px rgba(16,185,129,0.7), 0 0 20px 4px rgba(16,185,129,0.3);
        animation: scan-sweep 1.8s ease-in-out infinite;
        border-radius: 1px;
      }
    `}</style>
    <div className="scan-line" />
  </>
);

const ScanFrame = ({ flash }) => (
  <div className={`absolute inset-0 transition-all duration-150 ${flash ? "opacity-0" : "opacity-100"}`}>
    <span className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-sm" />
    <span className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-sm" />
    <span className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-sm" />
    <span className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-sm" />
  </div>
);

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const [scanMode, setScanMode]     = useState("camera");
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [flashGreen, setFlashGreen] = useState(false);
  const [addedMsg, setAddedMsg]     = useState("");

  const videoRef     = useRef(null);
  const readerRef    = useRef(null);
  const controlsRef  = useRef(null);
  const inputRef     = useRef(null);
  const lastRef      = useRef("");
  const productsRef  = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);

  const stopCamera = useCallback(() => {
    try { controlsRef.current?.stop(); } catch {}
    controlsRef.current = null;
    setIsDetecting(false);
  }, []);

  /* ── Core: process barcode → find product → add to cart immediately ── */
  const processBarcode = useCallback((barcode) => {
    const trimmed = barcode.trim();
    if (!trimmed) return;
    if (trimmed === lastRef.current) return;
    lastRef.current = trimmed;
    setTimeout(() => { lastRef.current = ""; }, 3000);

    const product = productsRef.current.find(
      (p) => p.barcode && p.barcode.trim() === trimmed
    );

    setFlashGreen(true);
    playBeep(!!product);
    setTimeout(() => setFlashGreen(false), 300);

    if (product) {
      // ── AUTO-ADD: call onScan immediately, no button press needed ──
      onScan(product);
      setAddedMsg(product.name);
      stopCamera();
      setScanResult({ barcode: trimmed, product, added: true });
    } else {
      stopCamera();
      setScanResult({ barcode: trimmed, product: null, added: false });
    }
  }, [stopCamera, onScan]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setScanResult(null);
    setFlashGreen(false);
    setAddedMsg("");
    if (!videoRef.current) return;
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        BarcodeFormat.ITF, BarcodeFormat.CODABAR,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      readerRef.current = new BrowserMultiFormatReader(hints);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) throw new Error("No camera found on this device.");
      const deviceId =
        devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ??
        devices[devices.length - 1].deviceId;
      setIsDetecting(true);
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        deviceId, videoRef.current,
        (result, err) => {
          if (result) { processBarcode(result.getText()); return; }
          if (err && !(err instanceof NotFoundException)) {
            const msg = err?.message || "";
            if (!msg.includes("No MultiFormat") && !msg.includes("No code detected")) {
              console.warn("[Scanner]", err);
            }
          }
        }
      );
    } catch (err) {
      setIsDetecting(false);
      if (err.name === "NotAllowedError") setCameraError("Camera permission denied. Allow camera access in browser settings.");
      else if (err.name === "NotFoundError" || err.message?.includes("No camera")) setCameraError("No camera found. Use manual entry.");
      else if (err.name === "NotReadableError") setCameraError("Camera in use by another app. Close it and try again.");
      else setCameraError(`Camera error: ${err.message}`);
    }
  }, [processBarcode]);

  useEffect(() => {
    if (isOpen && scanMode === "camera" && !scanResult) {
      const t = setTimeout(startCamera, 300);
      return () => { clearTimeout(t); stopCamera(); };
    }
    if (!isOpen) { stopCamera(); }
  }, [isOpen, scanMode, scanResult]); // eslint-disable-line

  useEffect(() => {
    if (isOpen && scanMode === "manual") setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, scanMode]);

  const handleScanAgain = () => {
    setScanResult(null);
    setAddedMsg("");
    lastRef.current = "";
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) { processBarcode(manualBarcode.trim()); setManualBarcode(""); }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setCameraError("");
    setManualBarcode("");
    setFlashGreen(false);
    setAddedMsg("");
    onClose();
  };

  return (
    <ModernModal isOpen={isOpen} onClose={handleClose} title="Barcode Scanner" subtitle="Scan product barcode to add to cart" size="md" icon={Scan} iconColor="emerald">
      <div className="space-y-4">

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[{ id: "camera", icon: Camera, label: "Camera" }, { id: "manual", icon: Keyboard, label: "Manual" }].map(({ id, icon: Icon, label }) => (
            <button key={id}
              onClick={() => { setScanMode(id); setScanResult(null); setCameraError(""); setAddedMsg(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${scanMode === id ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Result panel */}
        {scanResult && (
          <div className={`rounded-xl border-2 p-4 ${scanResult.product ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/15" : "border-red-400 bg-red-50 dark:bg-red-900/20"}`}>
            <div className="flex items-start gap-3">
              {scanResult.product
                ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1 tracking-wider">{scanResult.barcode}</p>
                {scanResult.product ? (
                  <>
                    <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{scanResult.product.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{formatCurrency(scanResult.product.price, "Rs.")}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scanResult.product.stock <= 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                        Stock: {scanResult.product.stock} {scanResult.product.unit}
                      </span>
                    </div>
                    {scanResult.added && (
                      <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Added to cart!
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-bold text-red-700 dark:text-red-400">Product Not Found</p>
                    <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">No product matches this barcode. Make sure it is assigned in Products.</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <ModernButton variant={scanResult.product ? "outline" : "primary"} className="flex-1" icon={RefreshCw} onClick={handleScanAgain}>
                Scan Again
              </ModernButton>
              {scanResult.added && (
                <ModernButton variant="primary" className="flex-1" icon={Package} onClick={handleClose}>
                  Done
                </ModernButton>
              )}
            </div>
          </div>
        )}

        {/* Camera view */}
        {scanMode === "camera" && !scanResult && (
          <div className="space-y-3">
            {cameraError ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Camera Error</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{cameraError}</p>
                  <button onClick={startCamera} className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 underline underline-offset-2">Try again</button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative" style={{ width: "72%", height: "38%" }}>
                    <ScanFrame flash={flashGreen} />
                    {isDetecting && !flashGreen && <ScanLine />}
                    {flashGreen && <div className="absolute inset-0 bg-emerald-400/30 rounded-sm" />}
                  </div>
                </div>
                {isDetecting && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/65 backdrop-blur-sm text-emerald-400 text-xs font-semibold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Point camera at barcode
                    </span>
                  </div>
                )}
                {!isDetecting && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-300">Starting camera...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!cameraError && <p className="text-xs text-center text-slate-400 dark:text-slate-500">Product is added to cart automatically when barcode is detected</p>}
          </div>
        )}

        {/* Manual entry */}
        {scanMode === "manual" && !scanResult && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Enter Barcode</label>
              <input ref={inputRef} type="text" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Type or paste barcode..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-mono tracking-widest outline-none"
                autoFocus />
            </div>
            <ModernButton type="submit" variant="primary" className="w-full" disabled={!manualBarcode.trim()} icon={Scan}>
              Search & Add to Cart
            </ModernButton>
            {products.filter((p) => p.barcode).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {products.filter((p) => p.barcode).slice(0, 8).map((product) => (
                    <button key={product._id || product.id} type="button" onClick={() => processBarcode(product.barcode)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {product.barcode}
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
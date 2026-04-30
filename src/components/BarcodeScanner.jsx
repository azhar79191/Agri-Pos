import React, { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Scan, Camera, Keyboard, AlertCircle, Package, XCircle, CheckCircle, RefreshCw } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";
import { formatCurrency } from "../utils/helpers";

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const [scanMode, setScanMode] = useState("camera");
  const [manualBarcode, setManualBarcode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  // null = scanning, { barcode, product } = result shown
  const [scanResult, setScanResult] = useState(null);

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const inputRef = useRef(null);
  const lastScannedRef = useRef("");
  const controlsRef = useRef(null);
  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsDetecting(false);
  }, []);

  const processBarcode = useCallback((barcode) => {
    const trimmed = barcode.trim();
    if (trimmed === lastScannedRef.current) return;
    lastScannedRef.current = trimmed;
    setTimeout(() => { lastScannedRef.current = ""; }, 3000);

    const product = productsRef.current.find(
      (p) => p.barcode && p.barcode.trim() === trimmed
    );

    // Pause camera and show result
    stopCamera();
    setScanResult({ barcode: trimmed, product: product || null });
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    setScanResult(null);
    if (!videoRef.current) return;
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
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
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) processBarcode(result.getText());
          if (err && !(err instanceof NotFoundException)) console.warn(err);
        }
      );
    } catch (err) {
      setIsDetecting(false);
      if (err.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.message?.includes("No camera")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  }, [processBarcode]);

  useEffect(() => {
    if (isOpen && scanMode === "camera" && !scanResult) {
      const t = setTimeout(startCamera, 300);
      return () => { clearTimeout(t); stopCamera(); };
    } else if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, scanMode, scanResult]);

  useEffect(() => {
    if (isOpen && scanMode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scanMode]);

  const handleAddToCart = () => {
    if (scanResult?.product) {
      onScan(scanResult.product);
      handleClose();
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    lastScannedRef.current = "";
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      processBarcode(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setCameraError("");
    setManualBarcode("");
    onClose();
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Barcode Scanner"
      subtitle="Scan or enter product barcode"
      size="md"
      icon={Scan}
      iconColor="emerald"
    >
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {[{ id: "camera", icon: Camera, label: "Camera" }, { id: "manual", icon: Keyboard, label: "Manual" }].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setScanMode(id); setScanResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                scanMode === id
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── SCAN RESULT ── */}
        {scanResult && (
          <div className={`rounded-lg border-2 p-4 ${
            scanResult.product
              ? "border-emerald-400 bg-emerald-50 dark:bg-blue-900/15"
              : "border-red-400 bg-red-50 dark:bg-red-900/20"
          }`}>
            <div className="flex items-start gap-3">
              {scanResult.product ? (
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-1">{scanResult.barcode}</p>
                {scanResult.product ? (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-white text-base">{scanResult.product.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-emerald-600 font-bold text-sm">
                        {formatCurrency(scanResult.product.price, "Rs.")}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        scanResult.product.stock <= 0
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}>
                        Stock: {scanResult.product.stock} {scanResult.product.unit}
                      </span>
                      {scanResult.product.category && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          {scanResult.product.category}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-700 dark:text-red-400">Item Not Available</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      No product found with this barcode. Check if the barcode is assigned in Products.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {scanResult.product && scanResult.product.stock > 0 && (
                <ModernButton variant="primary" className="flex-1" icon={Package} onClick={handleAddToCart}>
                  Add to Cart
                </ModernButton>
              )}
              <ModernButton
                variant={scanResult.product ? "outline" : "primary"}
                className="flex-1"
                icon={RefreshCw}
                onClick={handleScanAgain}
              >
                Scan Again
              </ModernButton>
            </div>
          </div>
        )}

        {/* ── CAMERA VIEW ── */}
        {scanMode === "camera" && !scanResult && (
          <div className="space-y-3">
            {cameraError ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400">{cameraError}</p>
                  <button onClick={startCamera} className="mt-2 text-xs text-red-600 underline">Try again</button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-36 relative">
                    {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
                      <div key={i} className={`absolute w-6 h-6 border-emerald-400 ${cls}`} />
                    ))}
                    {isDetecting && (
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    )}
                  </div>
                </div>
                {isDetecting && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="px-3 py-1 bg-black/60 text-emerald-400 text-xs rounded-full">
                      Point camera at barcode...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── MANUAL MODE ── */}
        {scanMode === "manual" && !scanResult && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Barcode
              </label>
              <input
                ref={inputRef}
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Type or paste barcode..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-mono tracking-wider"
                autoFocus
              />
            </div>
            <ModernButton type="submit" variant="primary" className="w-full" disabled={!manualBarcode.trim()} icon={Scan}>
              Search Product
            </ModernButton>
            {products.filter(p => p.barcode).length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {products.filter(p => p.barcode).slice(0, 6).map((product) => (
                    <button
                      key={product._id || product.id}
                      type="button"
                      onClick={() => processBarcode(product.barcode)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                    >
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

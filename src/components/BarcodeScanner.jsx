import React, { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { Scan, Camera, Keyboard, AlertCircle } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const [scanMode, setScanMode] = useState("camera");
  const [manualBarcode, setManualBarcode] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [cameraError, setCameraError] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const inputRef = useRef(null);
  const lastScannedRef = useRef("");
  const controlsRef = useRef(null);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsDetecting(false);
  }, []);

  const processBarcode = useCallback((barcode) => {
    if (barcode === lastScannedRef.current) return;
    lastScannedRef.current = barcode;
    setTimeout(() => { lastScannedRef.current = ""; }, 2000);

    const product = products.find((p) => p.barcode === barcode);
    setRecentScans((prev) => [{
      id: Date.now(), barcode,
      product: product || null,
      timestamp: new Date().toLocaleTimeString(),
      success: !!product,
    }, ...prev].slice(0, 5));

    if (product) {
      onScan(product);
      stopCamera();
      setTimeout(() => { onClose(); setRecentScans([]); }, 800);
    }
  }, [products, onScan, onClose, stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError("");
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

      const deviceId = devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId
        ?? devices[devices.length - 1].deviceId;

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
    if (isOpen && scanMode === "camera") {
      // Small delay ensures the video element is mounted in the DOM
      const t = setTimeout(startCamera, 300);
      return () => { clearTimeout(t); stopCamera(); };
    } else {
      stopCamera();
    }
  }, [isOpen, scanMode]);

  useEffect(() => {
    if (isOpen && scanMode === "manual") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scanMode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      processBarcode(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  const handleClose = () => {
    stopCamera();
    setRecentScans([]);
    setCameraError("");
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
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          {[{ id: "camera", icon: Camera, label: "Camera" }, { id: "manual", icon: Keyboard, label: "Manual" }].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setScanMode(id)}
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

        {/* Camera Mode */}
        {scanMode === "camera" && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-400">{cameraError}</p>
                  <button onClick={startCamera} className="mt-2 text-xs text-red-600 underline">Try again</button>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
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
                    <span className="px-3 py-1 bg-black/60 text-emerald-400 text-xs rounded-full">Scanning...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual Mode */}
        {scanMode === "manual" && (
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-mono tracking-wider"
                autoFocus
              />
            </div>
            <ModernButton type="submit" variant="primary" className="w-full" disabled={!manualBarcode.trim()} icon={Scan}>
              Search Product
            </ModernButton>
            {products.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {products.slice(0, 5).map((product) => (
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

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Scans</h4>
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    scan.success
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      scan.success ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    }`}>
                      {scan.success ? "✓" : "✗"}
                    </div>
                    <div>
                      <p className="font-mono text-sm">{scan.barcode}</p>
                      <p className={`text-xs ${scan.success ? "text-emerald-600" : "text-red-500"}`}>
                        {scan.success ? scan.product.name : "Product not found"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{scan.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModernModal>
  );
};

export default BarcodeScanner;

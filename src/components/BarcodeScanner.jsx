import React, { useState, useRef, useEffect } from "react";
import { Scan, X, Camera, Keyboard } from "lucide-react";
import ModernButton from "./ui/ModernButton";
import ModernModal from "./ui/ModernModal";

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const [scanMode, setScanMode] = useState("camera"); // "camera" or "manual"
  const [manualBarcode, setManualBarcode] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen, scanMode]);

  // Handle manual barcode entry
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      processBarcode(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  // Process scanned barcode
  const processBarcode = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    
    const scanResult = {
      id: Date.now(),
      barcode,
      product: product || null,
      timestamp: new Date().toLocaleTimeString(),
      success: !!product
    };
    
    setRecentScans(prev => [scanResult, ...prev].slice(0, 5));
    
    if (product) {
      onScan(product);
      // Don't close immediately so user can see success
      setTimeout(() => {
        onClose();
        setRecentScans([]);
      }, 800);
    }
  };

  // Simulate camera scan
  const simulateCameraScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      // Randomly pick a product for demo
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      if (randomProduct) {
        processBarcode(randomProduct.barcode);
      }
      setIsScanning(false);
    }, 1500);
  };

  // Handle keyboard input for quick scan
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleManualSubmit(e);
    }
  };

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode Scanner"
      subtitle="Scan or enter product barcode"
      size="md"
      icon={Scan}
      iconColor="emerald"
    >
      <div className="space-y-6">
        {/* Scan Mode Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
          <button
            onClick={() => setScanMode("camera")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              scanMode === "camera"
                ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            onClick={() => setScanMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              scanMode === "manual"
                ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {/* Camera Mode */}
        {scanMode === "camera" && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              {/* Simulated Camera View */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-48 h-32 border-2 border-dashed border-emerald-500/50 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Scan className="w-12 h-12 text-emerald-500/50" />
                    </div>
                    <p className="text-gray-400 text-sm">Position barcode within frame</p>
                  </div>
                )}
              </div>
              
              {/* Scan Line Animation */}
              {isScanning && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-scan" />
              )}
            </div>
            
            <ModernButton
              variant="primary"
              className="w-full"
              onClick={simulateCameraScan}
              loading={isScanning}
              icon={Scan}
            >
              {isScanning ? "Scanning..." : "Scan Barcode"}
            </ModernButton>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Demo: Click scan to simulate finding a random product
            </p>
          </div>
        )}

        {/* Manual Mode */}
        {scanMode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Barcode
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type or paste barcode..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg font-mono tracking-wider"
                  autoFocus
                />
              </div>
            </div>
            
            <ModernButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!manualBarcode.trim()}
              icon={Scan}
            >
              Search Product
            </ModernButton>
            
            {/* Quick Barcode Hints */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Demo Barcodes (click to use):
              </p>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => processBarcode(product.barcode)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {product.barcode}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recent Scans
            </h4>
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    scan.success
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      scan.success
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600"
                    }`}>
                      {scan.success ? "✓" : "✗"}
                    </div>
                    <div>
                      <p className="font-mono text-sm">{scan.barcode}</p>
                      {scan.product && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {scan.product.name}
                        </p>
                      )}
                      {!scan.success && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Product not found
                        </p>
                      )}
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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

const BarcodeScanner = ({ isOpen, onClose, onScan, products }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const readerRef = useRef(null);
  const lastScanRef = useRef("");

  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  // Stop camera
  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  }, []);

  // Process scanned barcode
  const handleScan = useCallback((barcode) => {
    const trimmed = barcode.trim();

    // prevent duplicate scans
    if (lastScanRef.current === trimmed) return;
    lastScanRef.current = trimmed;

    setTimeout(() => {
      lastScanRef.current = "";
    }, 2000);

    console.log("SCANNED BARCODE:", trimmed);

    // find product
    const product = products.find(
      (p) => p.barcode?.trim() === trimmed
    );

    console.log("MATCHED PRODUCT:", product);

    stopCamera();

    setResult({
      barcode: trimmed,
      product: product || null,
    });
  }, [products, stopCamera]);

  // Start camera
  const startCamera = useCallback(async () => {
    setError("");
    setResult(null);

    if (!videoRef.current) return;

    try {
      readerRef.current = new BrowserMultiFormatReader();

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (!devices.length) {
        throw new Error("No camera found");
      }

      // Use last camera (better for desktop)
      const selectedDeviceId = devices[devices.length - 1].deviceId;

      console.log("Using camera:", selectedDeviceId);

      setIsScanning(true);

      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleScan(result.getText());
          }

          if (err && !(err instanceof NotFoundException)) {
            console.error("SCAN ERROR:", err);
          }
        }
      );

    } catch (err) {
      console.error(err);
      setIsScanning(false);

      if (err.name === "NotAllowedError") {
        setError("Camera permission denied");
      } else {
        setError(err.message);
      }
    }
  }, [handleScan]);

  // Start/Stop based on modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(startCamera, 300);
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  // Close handler
  const handleClose = () => {
    stopCamera();
    setResult(null);
    setError("");
    onClose();
  };

  const handleAdd = () => {
    if (result?.product) {
      onScan(result.product);
      handleClose();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Barcode Scanner</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!result && (
        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: 400 }}
            muted
            autoPlay
          />
          {isScanning && <p>Scanning...</p>}
        </div>
      )}

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Barcode:</strong> {result.barcode}</p>

          {result.product ? (
            <>
              <p style={{ color: "green" }}>
                ✅ Product Found: {result.product.name}
              </p>
              <button onClick={handleAdd}>Add to Cart</button>
            </>
          ) : (
            <p style={{ color: "red" }}>
              ❌ Product Not Found
            </p>
          )}

          <button onClick={() => setResult(null)}>Scan Again</button>
        </div>
      )}

      <br />
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default BarcodeScanner;
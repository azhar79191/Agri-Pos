import React, { useRef } from "react";
import { Printer, Download, Copy, Check } from "lucide-react";
import { generateEAN13SVG, validateEAN13 } from "../utils/barcodeGenerator";
import ModernButton from "./ui/ModernButton";

/**
 * BarcodeDisplay Component
 * Shows barcode image with print, download, and copy functionality
 */
const BarcodeDisplay = ({ barcode, productName, sku, className = "" }) => {
  const [copied, setCopied] = React.useState(false);
  const svgRef = useRef(null);

  if (!barcode) return null;

  const isValid = validateEAN13(barcode);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const svg = generateEAN13SVG(barcode, { width: 300, height: 150 });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${productName || barcode}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .barcode-container {
              text-align: center;
              page-break-inside: avoid;
            }
            .product-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .sku {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .barcode-code {
              font-family: monospace;
              font-size: 16px;
              margin-top: 8px;
              color: #374151;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            ${productName ? `<div class="product-name">${productName}</div>` : ""}
            ${sku ? `<div class="sku">SKU: ${sku}</div>` : ""}
            ${svg}
            <div class="barcode-code">${barcode}</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const svg = generateEAN13SVG(barcode, { width: 400, height: 200 });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcode-${barcode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  let svg;
  try {
    svg = generateEAN13SVG(barcode, { width: 300, height: 120 });
  } catch (err) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          Invalid barcode format: {err.message}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Barcode Image */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div
          ref={svgRef}
          className="flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        
        {/* Validation Status */}
        {!isValid && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 text-center">
            ⚠️ Check digit may be invalid
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <ModernButton
          variant="outline"
          size="sm"
          icon={Printer}
          onClick={handlePrint}
          className="flex-1"
        >
          Print
        </ModernButton>
        
        <ModernButton
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleDownload}
          className="flex-1"
        >
          Download
        </ModernButton>
        
        <ModernButton
          variant="outline"
          size="sm"
          icon={copied ? Check : Copy}
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? "Copied!" : "Copy"}
        </ModernButton>
      </div>
    </div>
  );
};

export default BarcodeDisplay;

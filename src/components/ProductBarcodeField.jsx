import React, { useState } from "react";
import { Sparkles, RefreshCw, Eye, EyeOff, AlertCircle } from "lucide-react";
import { generateRandomEAN13, validateEAN13 } from "../utils/barcodeGenerator";
import BarcodeDisplay from "./BarcodeDisplay";
import ModernButton from "./ui/ModernButton";
import Input from "./ui/Input";

/**
 * ProductBarcodeField Component
 * Drop-in field for Add/Edit Product forms with auto-generate, preview, and print
 */
const ProductBarcodeField = ({ value, onChange, productName, sku, className = "" }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    const newBarcode = generateRandomEAN13("200"); // 200 prefix for internal use
    onChange(newBarcode);
    setShowPreview(true);
  };

  const isValid = value && validateEAN13(value);
  const hasValue = value && value.trim().length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input Field with Generate Button */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="Barcode (EAN-13)"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter 13-digit barcode or generate"
              maxLength={13}
              className="font-mono"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <ModernButton
              type="button"
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleGenerate}
              className="whitespace-nowrap"
            >
              Generate
            </ModernButton>
            
            {hasValue && (
              <ModernButton
                type="button"
                variant="ghost"
                size="sm"
                icon={showPreview ? EyeOff : Eye}
                onClick={() => setShowPreview(!showPreview)}
              />
            )}
          </div>
        </div>

        {/* Validation Message */}
        {hasValue && !isValid && (
          <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <p className="font-semibold">Invalid EAN-13 format</p>
              <p className="mt-0.5">
                Must be exactly 13 digits with valid check digit. Click "Generate" for a valid barcode.
              </p>
            </div>
          </div>
        )}

        {hasValue && isValid && !showPreview && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Valid EAN-13 barcode</span>
          </div>
        )}
      </div>

      {/* Barcode Preview */}
      {showPreview && hasValue && isValid && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Barcode Preview
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Hide
            </button>
          </div>
          <BarcodeDisplay
            barcode={value}
            productName={productName}
            sku={sku}
          />
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Generate a unique EAN-13 barcode or enter an existing one. This barcode can be scanned at POS.
      </p>
    </div>
  );
};

export default ProductBarcodeField;

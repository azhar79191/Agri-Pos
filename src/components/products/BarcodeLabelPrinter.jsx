import React, { useRef, useState } from "react";
import { Printer, X, Tag, ChevronDown } from "lucide-react";

// Simple Code128-style barcode renderer using SVG bars
// Encodes each character as alternating black/white bars based on char code
const BarcodeStripes = ({ value, width = 120, height = 36 }) => {
  if (!value) return <div style={{ width, height }} className="bg-slate-200 rounded" />;

  const bars = [];
  let x = 0;
  const barW = width / (value.length * 8 + 4);

  // Start quiet zone + start bar
  bars.push(<rect key="s" x={x} y={0} width={barW * 2} height={height} fill="black" />);
  x += barW * 3;

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      const bit = (code >> b) & 1;
      if (bit) bars.push(<rect key={`${i}-${b}`} x={x} y={0} width={barW} height={height} fill="black" />);
      x += barW;
    }
    x += barW * 0.5; // inter-char gap
  }

  // Stop bar
  bars.push(<rect key="e" x={x} y={0} width={barW * 2} height={height} fill="black" />);

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <rect width={width} height={height} fill="white" />
      {bars}
    </svg>
  );
};

const LABEL_SIZES = [
  { id: "small",  label: "Small  (4×2 cm)",  w: "4cm",  h: "2cm",  cols: 5 },
  { id: "medium", label: "Medium (6×3 cm)",  w: "6cm",  h: "3cm",  cols: 4 },
  { id: "large",  label: "Large  (8×4 cm)",  w: "8cm",  h: "4cm",  cols: 3 },
];

const BarcodeLabelPrinter = ({ products, settings, onClose }) => {
  const [selected, setSelected]   = useState(new Set(products.map((p) => p._id || p.id)));
  const [sizeId, setSizeId]       = useState("medium");
  const [copies, setCopies]       = useState(1);
  const printRef                  = useRef(null);
  const size                      = LABEL_SIZES.find((s) => s.id === sizeId);

  const toggleProduct = (id) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const selectedProducts = products.filter((p) => selected.has(p._id || p.id));

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <html><head><title>Price Labels — ${settings?.shopName || "AgriNest"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: white; }
        .grid { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; }
        .label {
          width: ${size.w}; height: ${size.h};
          border: 1px solid #ccc; border-radius: 4px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 4px; overflow: hidden; page-break-inside: avoid;
        }
        .shop  { font-size: 7px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .name  { font-size: 9px; font-weight: bold; text-align: center; line-height: 1.2; margin: 2px 0; }
        .price { font-size: 13px; font-weight: 900; color: #059669; }
        .code  { font-size: 7px; color: #888; font-family: monospace; margin-top: 1px; }
        @media print { body { margin: 0; } .grid { gap: 2px; padding: 4px; } }
      </style></head>
      <body><div class="grid">${content}</div></body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: "scale-in 0.15s ease both" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Print Price Labels</p>
              <p className="text-xs text-slate-400">{selectedProducts.length} labels selected</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left — settings + product list */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 p-4 space-y-4 overflow-y-auto flex-shrink-0">
            {/* Label size */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Label Size</label>
              <div className="space-y-1.5">
                {LABEL_SIZES.map((s) => (
                  <button key={s.id} onClick={() => setSizeId(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      sizeId === s.id
                        ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Copies per product</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setCopies((c) => Math.max(1, c - 1))} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">−</button>
                <span className="w-8 text-center font-bold text-slate-900 dark:text-white text-sm">{copies}</span>
                <button onClick={() => setCopies((c) => Math.min(10, c + 1))} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors">+</button>
              </div>
            </div>

            {/* Product selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Products</label>
                <button onClick={() => setSelected(selected.size === products.length ? new Set() : new Set(products.map((p) => p._id || p.id)))}
                  className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                  {selected.size === products.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {products.map((p) => {
                  const id = p._id || p.id;
                  return (
                    <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      <input type="checkbox" checked={selected.has(id)} onChange={() => toggleProduct(id)} className="rounded" />
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">{p.name}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                        {settings?.currency} {p.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — preview */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Preview</p>
            <div className="flex flex-wrap gap-2" ref={printRef}>
              {selectedProducts.flatMap((p) =>
                Array.from({ length: copies }, (_, ci) => (
                  <div key={`${p._id}-${ci}`}
                    style={{ width: size.w, minHeight: size.h }}
                    className="bg-white border border-slate-300 rounded-lg flex flex-col items-center justify-center p-1.5 overflow-hidden shadow-sm">
                    <p className="text-[7px] text-slate-400 uppercase tracking-widest">{settings?.shopName || "AgriNest"}</p>
                    <p className="text-[9px] font-bold text-slate-900 text-center leading-tight mt-0.5 line-clamp-2">{p.name}</p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">{settings?.currency} {p.price}</p>
                    {p.barcode && (
                      <>
                        <BarcodeStripes value={p.barcode} width={90} height={24} />
                        <p className="text-[7px] text-slate-400 font-mono mt-0.5">{p.barcode}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
            {selectedProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Tag className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Select products to preview labels</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-400">
            {selectedProducts.length * copies} label{selectedProducts.length * copies !== 1 ? "s" : ""} will be printed
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={handlePrint} disabled={selectedProducts.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4" /> Print Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeLabelPrinter;

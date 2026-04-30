import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Loader2, Tag } from "lucide-react";
import { getMyShop } from "../../api/shopApi";
import { useApp } from "../../context/AppContext";
import SettingsCard from "./SettingsCard";

/**
 * Generic tag manager for brands or categories.
 * Props:
 *   title, desc, placeholder, emptyNote
 *   addFn(shopId, value)  → returns res.data.data.brands | .categories
 *   deleteFn(shopId, val) → same
 *   listKey: "brands" | "categories"
 */
const TagsPanel = ({ title, desc, placeholder, emptyNote, addFn, deleteFn, listKey }) => {
  const { actions } = useApp();
  const [shop, setShop] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getMyShop()
      .then(r => {
        const s = r.data.data?.shop;
        if (s) { setShop(s); setTags(s[listKey] || []); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listKey]);

  const handleAdd = async () => {
    const val = input.trim();
    if (!val || !shop) return;
    if (tags.map(t => t.toLowerCase()).includes(val.toLowerCase())) {
      actions.showToast({ message: `"${val}" already exists`, type: "error" }); return;
    }
    setAdding(true);
    try {
      const res = await addFn(shop._id, val);
      setTags(res.data.data[listKey]);
      setInput("");
      inputRef.current?.focus();
      actions.showToast({ message: `"${val}" added`, type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to add", type: "error" });
    } finally { setAdding(false); }
  };

  const handleDelete = async (val) => {
    if (!shop) return;
    setDeleting(val);
    try {
      const res = await deleteFn(shop._id, val);
      setTags(res.data.data[listKey]);
      actions.showToast({ message: `"${val}" removed`, type: "success" });
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Failed to remove", type: "error" });
    } finally { setDeleting(null); }
  };

  return (
    <SettingsCard title={title} desc={desc}>
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading...</span>
        </div>
      ) : !shop ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 dark:text-slate-400">No shop found. Complete shop setup first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input row */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
              placeholder={placeholder}
              className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!input.trim() || adding}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </div>

          {/* Tags */}
          {tags.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <Tag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">{emptyNote}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-blue-50 dark:bg-blue-900/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/25 transition-colors">
                  {tag}
                  <button
                    onClick={() => handleDelete(tag)}
                    disabled={deleting === tag}
                    className="flex items-center justify-center w-4 h-4 hover:text-red-500 disabled:opacity-50 transition-colors"
                  >
                    {deleting === tag ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            {tags.length} {listKey === "brands" ? "brand" : "categor"}{tags.length !== 1 ? (listKey === "brands" ? "s" : "ies") : (listKey === "brands" ? "" : "y")} · Changes save instantly
          </p>
        </div>
      )}
    </SettingsCard>
  );
};

export default TagsPanel;

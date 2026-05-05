import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, ArrowRight, Command, Clock, Zap, CornerDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MENU_GROUPS } from "../constants/menuGroups";

const RECENT_KEY = "agrinest_recent_searches";
const MAX_RECENT = 5;

// Flatten all pages from MENU_GROUPS
const ALL_PAGES = MENU_GROUPS.flatMap((group) =>
  group.children.map((child) => ({
    id: child.id,
    label: child.label,
    group: group.label,
    icon: child.icon,
    path: `/${child.id}`,
  }))
);

// Quick actions — direct shortcuts
const QUICK_ACTIONS = [
  { id: "qa-pos",      label: "New Sale",       sub: "Open POS billing",        path: "/pos",                  color: "emerald" },
  { id: "qa-product",  label: "Add Product",    sub: "Go to Products page",     path: "/products",             color: "blue" },
  { id: "qa-customer", label: "Add Customer",   sub: "Go to Customers page",    path: "/customers",            color: "cyan" },
  { id: "qa-purchase", label: "New Purchase",   sub: "Create Purchase Order",   path: "/purchases/orders",     color: "violet" },
  { id: "qa-report",   label: "View Reports",   sub: "Sales & profit reports",  path: "/reports",              color: "purple" },
  { id: "qa-stock",    label: "Check Stock",    sub: "Stock levels overview",   path: "/stock",                color: "orange" },
  { id: "qa-settings", label: "Settings",       sub: "App & shop settings",     path: "/settings",             color: "slate" },
  { id: "qa-staff",    label: "Staff Hub",      sub: "Users, roles & audit",    path: "/staff",                color: "indigo" },
];

const ACTION_COLORS = {
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  blue:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  cyan:    "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  violet:  "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  purple:  "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  orange:  "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  slate:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  indigo:  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
};

// Highlight matched text in a string
const Highlight = ({ text, query }) => {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
};

const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
};

const saveRecent = (item) => {
  const prev = getRecent().filter((r) => r.id !== item.id);
  localStorage.setItem(RECENT_KEY, JSON.stringify([item, ...prev].slice(0, MAX_RECENT)));
};

const removeRecent = (id) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter((r) => r.id !== id)));
};

const GlobalSearch = () => {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent]     = useState(getRecent);
  const inputRef                = useRef(null);
  const containerRef            = useRef(null);
  const listRef                 = useRef(null);
  const navigate                = useNavigate();

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen((v) => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setRecent(getRecent()); }
    else { setQuery(""); setActiveIdx(0); }
  }, [open]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Filtered page results
  const pageResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_PAGES.filter(
      (p) => p.label.toLowerCase().includes(q) || p.group.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query]);

  // Flat list of all navigable items for keyboard nav
  const flatItems = useMemo(() => {
    if (!query.trim()) return [...QUICK_ACTIONS, ...recent.map((r) => ({ ...r, isRecent: true }))];
    return pageResults;
  }, [query, pageResults, recent]);

  // Reset active index when results change
  useEffect(() => setActiveIdx(0), [flatItems]);

  const go = useCallback((item) => {
    saveRecent({ id: item.id, label: item.label, path: item.path, group: item.group || "Recent", icon: item.icon });
    setRecent(getRecent());
    navigate(item.path);
    setOpen(false);
  }, [navigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatItems[activeIdx]) {
        e.preventDefault();
        go(flatItems[activeIdx]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flatItems, activeIdx, go]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Group page results by section
  const grouped = useMemo(() => {
    return pageResults.reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [pageResults]);

  const hasQuery = query.trim().length > 0;

  return (
    <>
      {/* Trigger — desktop */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-violet-300 dark:hover:border-violet-600 hover:text-slate-600 dark:hover:text-slate-300 transition-all text-sm w-52"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Quick search...</span>
        <span className="flex items-center gap-0.5 text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 font-mono leading-none">
          <Command className="w-2.5 h-2.5" />K
        </span>
      </button>

      {/* Trigger — mobile */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Search className="w-[18px] h-[18px]" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            ref={containerRef}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            style={{ animation: "scale-in 0.15s ease both" }}
          >
            {/* ── Search input ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, features, settings..."
                className="flex-1 px-4 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:block text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* ── Results area ── */}
            <div ref={listRef} className="max-h-[420px] overflow-y-auto">

              {/* ── No query: Quick Actions + Recent ── */}
              {!hasQuery && (
                <>
                  {/* Quick Actions */}
                  <div className="px-4 pt-3 pb-1">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                      <Zap className="w-3 h-3" /> Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={action.id}
                          data-idx={idx}
                          onClick={() => go(action)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border ${
                            activeIdx === idx
                              ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700"
                              : "bg-slate-50 dark:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${ACTION_COLORS[action.color]}`}>
                            {action.label[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{action.label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{action.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recent.length > 0 && (
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> Recent
                        </p>
                        <button
                          onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                          className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      {recent.map((item, i) => {
                        const idx = QUICK_ACTIONS.length + i;
                        return (
                          <div
                            key={item.id}
                            data-idx={idx}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors group ${
                              activeIdx === idx ? "bg-slate-50 dark:bg-slate-800" : ""
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                            <button
                              onClick={() => go(item)}
                              className="flex-1 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate"
                            >
                              {item.label}
                            </button>
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded hidden group-hover:block">
                              {item.group}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeRecent(item.id); setRecent(getRecent()); }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-400 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── With query: Page results grouped ── */}
              {hasQuery && Object.keys(grouped).length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Search className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No results for "{query}"</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching for a page name or feature</p>
                </div>
              )}

              {hasQuery && Object.entries(grouped).map(([groupName, items]) => (
                <div key={groupName} className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {groupName}
                  </p>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const idx  = pageResults.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => go(item)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors group ${
                          activeIdx === idx
                            ? "bg-violet-50 dark:bg-violet-900/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          activeIdx === idx
                            ? "bg-violet-100 dark:bg-violet-900/40"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}>
                          <Icon className={`w-3.5 h-3.5 transition-colors ${
                            activeIdx === idx
                              ? "text-violet-600 dark:text-violet-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`} />
                        </span>

                        <span className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Highlight text={item.label} query={query} />
                        </span>

                        {/* Section badge */}
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden sm:block">
                          {item.group}
                        </span>

                        {activeIdx === idx
                          ? <CornerDownLeft className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                          : <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                        }
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1">↵</kbd> open</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1">ESC</kbd> close</span>
              </div>
              {hasQuery && (
                <span className="text-slate-400">
                  {pageResults.length} result{pageResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;

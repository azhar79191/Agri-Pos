import React, { useState, useCallback } from "react";
import { ShoppingBag, Plus, Search, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { usePaginatedApi } from "../../hooks/usePaginatedApi";
import { getPurchaseOrders } from "../../api/purchaseOrdersApi";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import POCard from "./po/POCard";
import CreatePOModal from "./po/CreatePOModal";
import PODetailModal from "./po/PODetailModal";
import { STATUSES } from "./po/poConfig";

const LIMIT = 12;

const PurchaseOrders = () => {
  const { state } = useApp();
  const { settings } = state;

  const { data: orders, loading, error, page, totalPages, total, setFilter, setPage, refresh } =
    usePaginatedApi(getPurchaseOrders, { search: "", status: "" }, LIMIT);

  const [showCreate, setShowCreate] = useState(false);
  const [detailPO, setDetailPO] = useState(null);

  /* ── handlers ── */
  const handleCreated = useCallback((order) => {
    refresh();
  }, [refresh]);

  const handleSent = useCallback((updated) => {
    refresh();
  }, [refresh]);

  const handleSendFromCard = useCallback((po) => {
    setDetailPO(po);
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Orders</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{total} order{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            onChange={e => setFilter("search", e.target.value)}
            placeholder="Search by PO # or supplier..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="relative">
          <select
            onChange={e => setFilter("status", e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={refresh} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(po => (
            <POCard
              key={po._id}
              po={po}
              currency={settings.currency}
              onView={setDetailPO}
              onSend={handleSendFromCard}
            />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="No purchase orders found"
          description="Create your first purchase order to get started"
          actionLabel="New PO"
          onAction={() => setShowCreate(true)}
        />
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Modals ── */}
      <CreatePOModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      <PODetailModal
        po={detailPO}
        isOpen={!!detailPO}
        onClose={() => setDetailPO(null)}
        onSent={handleSent}
        currency={settings.currency}
      />
    </div>
  );
};

export default PurchaseOrders;

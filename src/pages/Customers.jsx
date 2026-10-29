import useRecoveryRefresh from '../hooks/useRecoveryRefresh';
import { confirmAction } from "../utils/feedback";
import PageHeader from "../components/ui/PageHeader";
import FilterBar from "../components/ui/FilterBar";
import DataTable from "../components/ui/DataTable";
import ListFeedback from "../components/ui/ListFeedback";
import React, { useState, useMemo, useEffect } from "react";
import { Plus, Users, Download, Search } from "lucide-react";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import { formatCurrency } from "../utils/helpers";
import Pagination from "../components/ui/Pagination";
import { exportCustomers } from "../utils/excelExport";
import CustomerRow from "../components/customers/CustomerRow";
import CustomerStatsCards from "../components/customers/CustomerStatsCards";
import { useCustomerForm } from "../hooks/useCustomerForm";
import BulkActionBar from "../components/ui/BulkActionBar";
import { deleteCustomer } from "../api/customersApi";

const LIMIT = 15;

const Customers = () => {
  const { customers, loading, error, fetchCustomers } = useCustomers();
  const { state, actions } = useApp();
  const { settings } = state;
  const navigate = useNavigate();

  const {
    isModalOpen, setIsModalOpen,
    editingCustomer, deleteConfirm, setDeleteConfirm,
    formData, submitting,
    openAdd, openEdit,
    handleChange, handleSubmit, confirmDelete, resetForm,
  } = useCustomerForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage]             = useState(1);
  const [sort, setSort] = useState({ index: null, direction: 'asc' });
  const sortFields = [null,"name","address","balance","balance"];
  const sortField = sortFields[sort.index];
  const sortQuery = sortField ? `${(sort.index === 4 ? sort.direction === 'asc' : sort.direction === 'desc') ? '-' : ''}${sortField}` : '-createdAt';
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [requested, setRequested] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [selected, setSelected]     = useState(new Set());

  const toggleSelect = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll    = () => setSelected(new Set(filteredCustomers.map((c) => c._id)));
  const clearSelect  = () => setSelected(new Set());

  const reloadList = () => { setRequested(true); return fetchCustomers({ page, limit: LIMIT, sort: sortQuery, search: searchTerm }).then(res => { if (res?.data?.pagination) setPagination(res.data.pagination); }); };
  useEffect(() => {
    setSelected(new Set());
    const timer = setTimeout(reloadList, 250);
    return () => clearTimeout(timer);
  }, [page, searchTerm, sortQuery]); // eslint-disable-line react-hooks/exhaustive-deps


  const filteredCustomers = customers;

  useRecoveryRefresh(()=>reloadList());
  const totalWalletBalance = useMemo(() => customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0), [customers]);
  const totalCreditBalance = useMemo(() => customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0), [customers]);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <PageHeader title={<>Customers</>} description={<>Manage your customer database</>} icon={Users} actions={<><div className="flex flex-wrap gap-2">
          <ModernButton variant="outline" onClick={() => exportCustomers(customers, settings.currency)} disabled={loading || !!error} icon={Download} size="sm">Export page</ModernButton>
          <ModernButton disabled={!actions.hasPermission("customers:create")} onClick={openAdd} icon={Plus}>Add Customer</ModernButton>
        </div></>}></PageHeader>

      <CustomerStatsCards
        totalCustomers={customers.length}
        totalWallet={formatCurrency(totalWalletBalance, settings.currency)}
        totalCredit={formatCurrency(totalCreditBalance, settings.currency)}
        currency={settings.currency}
      />

      {/* Search */}
      <FilterBar filters={[{ type: 'search', key: 'search', label: 'Search customers', placeholder: 'Search by name, phone, or email...' }]} values={{ search: searchTerm }} onChange={(_, value) => { setSearchTerm(value); setPage(1); }} onClear={() => { setSearchTerm(''); setPage(1); }} total={pagination.total} />

      <p className="text-xs text-slate-500 dark:text-slate-400">Summary cards and exports describe the loaded page. Search checks the full shop directory.</p>
      {bulkMessage && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">{bulkMessage}</p>}
      {/* Table */}
      <div className="card-base overflow-hidden">
        {error ? <ListFeedback error={error} onRetry={reloadList} /> : (
          <div className="overflow-x-auto">
            <DataTable loading={loading || !requested} loadingLabel="Loading customers" emptyState={false} sort={sort} onSortChange={next => { setSort(next); setPage(1); }} className="w-full table-premium">
              <thead>
                <tr>
                  <th className="w-10"><input type="checkbox" aria-label="Select all customers on this page" checked={selected.size === filteredCustomers.length && filteredCustomers.length > 0} onChange={(e) => e.target.checked ? selectAll() : clearSelect()} className="rounded" /></th>
                  {["Customer", "Address", "Wallet", "Owes (Credit)", "Actions"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <CustomerRow
                    key={customer._id}
                    customer={customer}
                    sortValues={[null, customer.name, customer.address, customer.walletBalance || 0, customer.creditBalance || 0]}
                    onEdit={actions.hasPermission("customers:edit") ? openEdit : null}
                    onDelete={actions.hasPermission("customers:delete") ? setDeleteConfirm : null}
                    onViewStatement={(c) => navigate(`/customers/${c._id}/statement`)}
                    currency={settings.currency}
                    selected={selected.has(customer._id)}
                    onSelect={() => toggleSelect(customer._id)}
                  />
                ))}
              </tbody>
            </DataTable>
            <ListFeedback empty={!loading && requested && filteredCustomers.length === 0} title={searchTerm ? 'No matching customers' : 'No active customers yet'} description={searchTerm ? 'Try another search or clear the filters.' : 'Add the first record to get started.'} onClear={searchTerm ? () => { setSearchTerm(""); setPage(1); } : undefined} />
          </div>
        )}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </div>

      {/* Add / Edit modal */}
      <ModernModal busy={submitting}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <ModernButton variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }} data-modal-dismiss data-dirty-change>Cancel</ModernButton>
            <ModernButton onClick={handleSubmit} loading={submitting}>{editingCustomer ? "Update" : "Add Customer"}</ModernButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter customer name" />
          <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
            <textarea id="customer-address" name="address" value={formData.address} onChange={handleChange} rows={3} required className="input-premium resize-none" placeholder="Enter complete address..." />
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Manage wallet balances through deposits and payments so every change appears in the customer ledger.</p>
        </form>
      </ModernModal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? The customer will be archived; financial history is retained.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      <BulkActionBar
        selectedIds={selected}
        totalCount={filteredCustomers.length}
        onSelectAll={selectAll}
        onClearAll={clearSelect}
        onExport={() => exportCustomers(filteredCustomers.filter((c) => selected.has(c._id)), settings.currency)}
        busy={bulkBusy}
        deleteLabel="Archive"
        onDelete={actions.hasPermission("customers:delete") ? async () => {
          if (!(await confirmAction(`Archive ${selected.size} selected customer records? History will be retained.`))) return;
          setBulkBusy(true);
          const ids = [...selected];
          const results = await Promise.allSettled(ids.map(id => deleteCustomer(id)));
          const failed = ids.filter((id, index) => results[index].status === 'rejected');
          setSelected(new Set(failed));
          setBulkMessage(`${ids.length - failed.length} archived. ${failed.length} could not be confirmed; refresh and review before retrying.`);
          await reloadList();
          setBulkBusy(false);
        } : null}
      />
    </div>
  );
};

export default Customers;

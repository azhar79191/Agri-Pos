import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, Phone, MapPin, Download, FileText, Search, Wallet } from "lucide-react";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import ModernButton from "../components/ui/ModernButton";
import Input from "../components/ui/Input";
import ModernModal, { ConfirmModal } from "../components/ui/ModernModal";
import { formatCurrency } from "../utils/helpers";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { exportCustomers } from "../utils/excelExport";

const LIMIT = 15;
const emptyForm = { name: "", phone: "", address: "", creditBalance: "" };

const avatarColors = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-violet-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
];

const getAvatarColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const Customers = () => {
  const { customers, loading, fetchCustomers, addCustomer, editCustomer, removeCustomer } = useCustomers();
  const { state, actions } = useApp();
  const { settings } = state;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchCustomers({ page, limit: LIMIT }).then(res => {
      if (res?.data?.pagination) setPagination(res.data.pagination);
    });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCustomers = useMemo(() =>
    customers.filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [customers, searchTerm]
  );

  const resetForm = () => { setFormData(emptyForm); setEditingCustomer(null); };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone, address: customer.address, creditBalance: customer.creditBalance?.toString() || "0" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, creditBalance: parseFloat(formData.creditBalance) || 0 };
      if (editingCustomer) {
        await editCustomer(editingCustomer._id, payload);
        actions.showToast({ message: "Customer updated successfully", type: "success" });
      } else {
        await addCustomer(payload);
        actions.showToast({ message: "Customer added successfully", type: "success" });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      actions.showToast({ message: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally { setSubmitting(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalWalletBalance = customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);
  const totalCreditBalance = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
  const customersWithCredit = customers.filter(c => (c.creditBalance || 0) > 0).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customers</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your customer database</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ModernButton variant="outline" onClick={() => exportCustomers(customers, settings.currency)} icon={Download} size="sm">Export</ModernButton>
          <ModernButton onClick={() => { resetForm(); setIsModalOpen(true); }} icon={Plus}>Add Customer</ModernButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Customers",   value: customers.length,                                    icon: Users,  cls: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Total Wallet",       value: formatCurrency(totalWalletBalance, settings.currency), icon: Wallet, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Total Credit (Owes)",value: formatCurrency(totalCreditBalance, settings.currency), icon: Wallet, cls: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30" },
        ].map(({ label, value, icon: Icon, cls, bg }, i) => (
          <div key={label} className={`stat-card-premium animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${cls}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-bold mt-0.5 ${cls}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or address..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={LIMIT} cols={4} /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  {["Customer", "Address", "Wallet", "Owes (Credit)", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map(customer => (
                  <tr key={customer._id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(customer.name)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-bold text-sm">
                            {customer.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{customer.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />{customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                        <span className="line-clamp-2 text-xs">{customer.address || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {(customer.walletBalance || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Wallet className="w-3 h-3" />{formatCurrency(customer.walletBalance, settings.currency)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {(customer.creditBalance || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <Wallet className="w-3 h-3" />{formatCurrency(customer.creditBalance, settings.currency)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/customers/${customer._id}/statement`)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <FileText className="w-3.5 h-3.5" />Statement
                        </button>
                        <button onClick={() => handleEdit(customer)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(customer)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No customers found</p>
              </div>
            )}
          </div>
        )}
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
        </div>
      </div>

      {/* Modal */}
      <ModernModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <ModernButton variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</ModernButton>
            <ModernButton onClick={handleSubmit} loading={submitting}>{editingCustomer ? "Update Customer" : "Add Customer"}</ModernButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter customer name" />
          <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} required
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
              placeholder="Enter complete address..." />
          </div>
          <Input label="Wallet Balance" name="creditBalance" type="number" min="0" step="0.01" value={formData.creditBalance} onChange={handleChange} placeholder="0.00" helperText="Customer's available wallet balance" />
        </form>
      </ModernModal>

      <ConfirmModal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          try { await removeCustomer(deleteConfirm._id); actions.showToast({ message: "Customer deleted", type: "success" }); }
          catch { actions.showToast({ message: "Delete failed", type: "error" }); }
          setDeleteConfirm(null);
        }}
        title="Delete Customer" message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete" confirmVariant="danger" />
    </div>
  );
};

export default Customers;

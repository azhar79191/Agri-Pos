import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit2, Trash2, Users, Phone, MapPin, CreditCard, Download, FileText } from "lucide-react";
import { useCustomers } from "../context/CustomersContext";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal, { ConfirmModal } from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import { formatCurrency } from "../utils/helpers";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { exportCustomers } from "../utils/excelExport";

const LIMIT = 15;

const emptyForm = { name: "", phone: "", address: "", creditBalance: "" };

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
    customers.filter((c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.address?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [customers, searchTerm]
  );

  const resetForm = () => { setFormData(emptyForm); setEditingCustomer(null); };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      creditBalance: customer.creditBalance?.toString() || "0",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (customer) => {
    actions.showToast({
      message: `Are you sure you want to delete "${customer.name}"?`,
      type: "error",
      position: "center",
      isConfirm: true,
      onConfirm: async () => {
        try {
          await removeCustomer(customer._id);
          actions.showToast({ message: "Customer deleted", type: "success" });
        } catch {
          actions.showToast({ message: "Delete failed", type: "error" });
        }
      },
    });
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const totalCredit = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
  const customersWithCredit = customers.filter((c) => c.creditBalance > 0).length;

  const columns = [
    {
      key: "name", title: "Customer",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {value?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />{row.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "address", title: "Address",
      render: (value) => (
        <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{value}</span>
        </div>
      ),
    },
    {
      key: "creditBalance", title: "Credit / Wallet",
      render: (value, row) => (
        <div className="space-y-1">
          {value > 0
            ? <Badge variant="warning" size="sm"><CreditCard className="w-3 h-3 mr-1" />Owes {formatCurrency(value, settings.currency)}</Badge>
            : <Badge variant="success" size="sm">No Dues</Badge>
          }
          {(row.walletBalance || 0) > 0 && (
            <Badge variant="primary" size="sm">Wallet {formatCurrency(row.walletBalance, settings.currency)}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions", title: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${row._id}/statement`)} icon={FileText}>Statement</Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} icon={Edit2}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(row)} icon={Trash2}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCustomers(customers, settings.currency)} icon={Download}>Export</Button>
          <Button variant="primary" onClick={() => { resetForm(); setIsModalOpen(true); }} icon={Plus}>Add Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Credit Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{customersWithCredit}</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Credit</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCredit, settings.currency)}</p>
          </div>
        </Card>
      </div>

      <Card padding="md">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search customers by name, phone, or address..." />
      </Card>

      <Card padding="none">
        {loading ? <TableSkeleton rows={LIMIT} cols={4} /> : (
          <Table columns={columns} data={filteredCustomers} loading={false} emptyMessage="No customers found. Add your first customer to get started." />
        )}
        <Pagination page={page} totalPages={pagination.pages} total={pagination.total} limit={LIMIT} onPageChange={setPage} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter customer name" />
          <Input label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-200"
              placeholder="Enter complete address..."
            />
          </div>
          <Input
            label="Credit Balance"
            name="creditBalance"
            type="number"
            min="0"
            step="0.01"
            value={formData.creditBalance}
            onChange={handleChange}
            placeholder="0.00"
            helperText="Current outstanding credit amount (if any)"
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={async () => {
          try {
            await removeCustomer(deleteConfirm._id);
            actions.showToast({ message: "Customer deleted", type: "success" });
          } catch {
            actions.showToast({ message: "Delete failed", type: "error" });
          }
          setDeleteConfirm(null);
        }}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Customers;

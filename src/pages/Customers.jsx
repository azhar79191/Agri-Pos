import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Phone,
  MapPin,
  CreditCard
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal, { ConfirmModal } from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import { formatCurrency } from "../utils/helpers";

const Customers = () => {
  const { state, actions } = useApp();
  const { customers, settings } = state;

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    creditBalance: ""
  });

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [customers, searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      creditBalance: ""
    });
    setEditingCustomer(null);
  };

  // Open add modal
  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      creditBalance: customer.creditBalance.toString()
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (customer) => {
    actions.showToast({
      message: `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
      type: "error",
      position: "center",
      isConfirm: true,
      onConfirm: () => {
        actions.deleteCustomer(customer.id);
      }
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      actions.deleteCustomer(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customerData = {
      ...formData,
      creditBalance: parseFloat(formData.creditBalance) || 0
    };

    if (editingCustomer) {
      actions.updateCustomer({ ...customerData, id: editingCustomer.id });
    } else {
      actions.addCustomer(customerData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Table columns
  const columns = [
    {
      key: "name",
      title: "Customer",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {value.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {row.phone}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "address",
      title: "Address",
      render: (value) => (
        <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{value}</span>
        </div>
      )
    },
    {
      key: "creditBalance",
      title: "Credit Balance",
      render: (value) => (
        <div>
          {value > 0 ? (
            <Badge variant="warning" size="sm">
              <CreditCard className="w-3 h-3 mr-1" />
              {formatCurrency(value, settings.currency)}
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              No Dues
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            icon={Edit2}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(row)}
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Calculate stats
  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const customersWithCredit = customers.filter((c) => c.creditBalance > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer database
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd} icon={Plus}>
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {customers.length}
            </p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Credit Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {customersWithCredit}
            </p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Credit</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalCredit, settings.currency)}
            </p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card padding="md">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name, phone, or address..."
        />
      </Card>

      {/* Customers Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={filteredCustomers}
          emptyMessage="No customers found. Add your first customer to get started."
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter customer name"
          />
          
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
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

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Customers;

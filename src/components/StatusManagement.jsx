import React, { useState } from "react";
import { Edit3, Check, X, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

const StatusManagement = ({ item, type = "invoice", onClose }) => {
  const { actions } = useApp();
  const [selectedStatus, setSelectedStatus] = useState(item.status);
  const [isEditing, setIsEditing] = useState(false);

  const statusOptions = [
    { value: "Pending", label: "Pending", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    { value: "Completed", label: "Completed", icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
    { value: "Cancelled", label: "Cancelled", icon: X, color: "text-red-600 bg-red-100" },
    { value: "Processing", label: "Processing", icon: AlertCircle, color: "text-blue-600 bg-blue-100" }
  ];

  const handleStatusUpdate = () => {
    if (type === "invoice") {
      actions.updateInvoiceStatus(item.id, selectedStatus);
    } else {
      actions.updateTransactionStatus(item.id, selectedStatus);
    }
    setIsEditing(false);
    onClose?.();
  };

  const getCurrentStatusConfig = () => {
    return statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];
  };

  const currentStatus = getCurrentStatusConfig();

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
          <currentStatus.icon className="w-3 h-3" />
          {currentStatus.label}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Edit status"
        >
          <Edit3 className="w-3 h-3 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleStatusUpdate}
        className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded transition-colors text-emerald-600"
        title="Save"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        onClick={() => {
          setSelectedStatus(item.status);
          setIsEditing(false);
        }}
        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600"
        title="Cancel"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default StatusManagement;
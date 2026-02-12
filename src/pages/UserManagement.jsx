import React, { useState } from "react";
import { Users, Plus, Edit3, Trash2, Shield, Eye, EyeOff, UserCheck, UserX, Settings, Key, Crown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { users, roles } from "../data/users";

const UserManagement = () => {
  const { state, actions } = useApp();
  const { employees } = state;
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
    phone: "",
    address: "",
    salary: "",
    permissions: []
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      actions.updateEmployee({ ...editingUser, ...formData });
      setEditingUser(null);
    } else {
      actions.addEmployee(formData);
    }
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "cashier",
      phone: "",
      address: "",
      salary: ""
    });
    setShowAddUser(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "cashier",
      phone: user.phone || "",
      address: user.address || "",
      salary: user.salary || "",
      permissions: user.permissions || []
    });
    setShowAddUser(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      actions.deleteEmployee(userId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "cashier",
      phone: "",
      address: "",
      salary: "",
      permissions: []
    });
    setEditingUser(null);
    setShowAddUser(false);
    setShowPermissions(false);
  };

  const handleGrantAllAccess = (userId) => {
    const allPermissions = [
      "dashboard", "products", "customers", "pos", "reports", "settings",
      "stock_management", "user_management", "delete_data", "financial_reports"
    ];
    actions.updateUserPermissions(userId, allPermissions);
    actions.showToast({ message: "Full access granted to user", type: "success" });
  };

  const handleRevokeAllAccess = (userId) => {
    actions.updateUserPermissions(userId, ["dashboard", "pos"]);
    actions.showToast({ message: "Access revoked, basic permissions retained", type: "warning" });
  };

  const handlePermissionToggle = (userId, permission) => {
    const user = [...users, ...employees].find(u => u.id === userId);
    if (!user) return;
    
    const currentPermissions = user.permissions || [];
    const hasPermission = currentPermissions.includes(permission);
    
    let newPermissions;
    if (hasPermission) {
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      newPermissions = [...currentPermissions, permission];
    }
    
    actions.updateUserPermissions(userId, newPermissions);
  };

  const availablePermissions = [
    { key: "dashboard", label: "Dashboard Access", description: "View main dashboard" },
    { key: "products", label: "Product Management", description: "Add, edit, delete products" },
    { key: "customers", label: "Customer Management", description: "Manage customer data" },
    { key: "pos", label: "Point of Sale", description: "Process sales transactions" },
    { key: "reports", label: "Reports", description: "View sales and inventory reports" },
    { key: "settings", label: "Settings", description: "Modify system settings" },
    { key: "stock_management", label: "Stock Management", description: "Manage inventory levels" },
    { key: "user_management", label: "User Management", description: "Manage users and permissions" },
    { key: "delete_data", label: "Delete Data", description: "Delete records from system" },
    { key: "financial_reports", label: "Financial Reports", description: "Access financial data" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* System Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            System Users
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} system users
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full bg-gray-100 ring-3 ring-emerald-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    roles[user.role]?.color === "purple" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                    roles[user.role]?.color === "blue" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}>
                    {roles[user.role]?.label}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.permissions.length} permissions
                  </div>
                </div>
                
                {state.currentUser?.role === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPermissions(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Manage
                    </button>
                    <button
                      onClick={() => handleGrantAllAccess(user.id)}
                      className="flex items-center justify-center px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg transition-colors"
                      title="Grant All Access"
                    >
                      <UserCheck className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRevokeAllAccess(user.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                      title="Revoke Access"
                    >
                      <UserX className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Users */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Employee Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Role</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Phone</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Join Date</th>
                <th className="text-left py-2 text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b dark:border-gray-700">
                  <td className="py-2 text-gray-900 dark:text-white">{employee.name}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{employee.email}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      employee.role === "admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      employee.role === "manager" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}>
                      {roles[employee.role]?.label || "Employee"}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{employee.phone}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-400">{employee.joinDate}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No employee users found. Add your first employee user.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 border rounded-lg pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required={!editingUser}
                      placeholder={editingUser ? "Leave blank to keep current password" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {Object.entries(roles).map(([key, role]) => (
                      <option key={key} value={key}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Salary</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Monthly salary"
                  />
                </div>

                {state.currentUser?.role === "admin" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Permissions</label>
                    <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {availablePermissions.map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, permissions: [...formData.permissions, perm.key] });
                              } else {
                                setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.key) });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingUser ? "Update User" : "Add User"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Management Modal */}
      {showPermissions && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Manage Permissions - {selectedUser.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPermissions(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => handleGrantAllAccess(selectedUser.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Grant All Access
                  </button>
                  <button
                    onClick={() => handleRevokeAllAccess(selectedUser.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    Revoke All Access
                  </button>
                </div>
                
                {availablePermissions.map((perm) => {
                  const hasPermission = selectedUser.permissions?.includes(perm.key);
                  return (
                    <div key={perm.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{perm.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{perm.description}</p>
                      </div>
                      <button
                        onClick={() => handlePermissionToggle(selectedUser.id, perm.key)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          hasPermission
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {hasPermission ? "Granted" : "Grant"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
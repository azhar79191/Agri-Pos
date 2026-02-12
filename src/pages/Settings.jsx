import React, { useState, useEffect } from "react";
import {
  Store,
  Percent,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Save,
  Moon,
  Sun,
  RefreshCw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const Settings = () => {
  const { state, actions } = useApp();
  const { settings, darkMode } = state;

  // Local state
  const [formData, setFormData] = useState({
    shopName: settings.shopName,
    taxRate: settings.taxRate.toString(),
    currency: settings.currency,
    address: settings.address,
    phone: settings.phone,
    email: settings.email
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when settings change
  useEffect(() => {
    setFormData({
      shopName: settings.shopName,
      taxRate: settings.taxRate.toString(),
      currency: settings.currency,
      address: settings.address,
      phone: settings.phone,
      email: settings.email
    });
  }, [settings]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = () => {
    const updatedSettings = {
      ...formData,
      taxRate: parseFloat(formData.taxRate) || 0
    };
    actions.updateSettings(updatedSettings);
    setHasChanges(false);
  };

  // Handle reset
  const handleReset = () => {
    setFormData({
      shopName: settings.shopName,
      taxRate: settings.taxRate.toString(),
      currency: settings.currency,
      address: settings.address,
      phone: settings.phone,
      email: settings.email
    });
    setHasChanges(false);
  };

  // Currency options
  const currencyOptions = [
    { value: "₹", label: "Indian Rupee (₹)" },
    { value: "$", label: "US Dollar ($)" },
    { value: "€", label: "Euro (€)" },
    { value: "£", label: "British Pound (£)" },
    { value: "¥", label: "Japanese Yen (¥)" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure your shop preferences
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="secondary" onClick={handleReset} icon={RefreshCw}>
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shop Information
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Basic details about your business
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter shop name"
                leftIcon={Store}
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
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-200"
                  placeholder="Enter complete address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  leftIcon={Phone}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  leftIcon={Mail}
                />
              </div>
            </div>
          </Card>

          {/* Tax & Currency */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tax & Currency
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configure tax rates and currency settings
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={handleChange}
                placeholder="0.00"
                leftIcon={Percent}
                helperText="Applied to all sales automatically"
              />
              <Select
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={currencyOptions}
              />
            </div>
          </Card>
        </div>

        {/* Appearance & Preferences */}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Customize your interface
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Toggle dark theme
                    </p>
                  </div>
                </div>
                <button
                  onClick={actions.toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Current Settings Preview */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Current Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Active configuration
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Shop Name</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.shopName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tax Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.taxRate}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.currency}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {darkMode ? "Dark" : "Light"}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => actions.setPage("dashboard")}
              >
                <Store className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => actions.setPage("pos")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

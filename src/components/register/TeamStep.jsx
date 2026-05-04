import { Plus, Trash2, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export const TeamStep = ({ members, onUpdate, onAdd, onRemove, showPasswords, togglePassword, shopName, onBack, onSubmit, saving }) => (
  <>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Team Members</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
        Add managers & cashiers for <span className="font-semibold text-emerald-600">{shopName}</span>. You can skip and add later.
      </p>
    </div>

    <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
      {members.map((m, i) => (
        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member {i + 1}</span>
            {members.length > 1 && (
              <button onClick={() => onRemove(i)} className="p-1 text-red-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={m.name}
              onChange={(e) => onUpdate(i, "name", e.target.value)}
              placeholder="Full Name"
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="email"
              value={m.email}
              onChange={(e) => onUpdate(i, "email", e.target.value)}
              placeholder="Email"
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <div className="relative">
              <input
                type={showPasswords[i] ? "text" : "password"}
                value={m.password}
                onChange={(e) => onUpdate(i, "password", e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 pr-8 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button type="button" onClick={() => togglePassword(i)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showPasswords[i] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <select
              value={m.role}
              onChange={(e) => onUpdate(i, "role", e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
        </div>
      ))}
    </div>

    <button onClick={onAdd} className="mt-3 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium">
      <Plus className="w-4 h-4" /> Add another member
    </button>

    <div className="flex gap-3 mt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button
        onClick={() => onSubmit(true)}
        disabled={saving}
        className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60"
      >
        Skip
      </button>
      <button
        onClick={() => onSubmit(false)}
        disabled={saving}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="w-5 h-5" /></>}
      </button>
    </div>
  </>
);

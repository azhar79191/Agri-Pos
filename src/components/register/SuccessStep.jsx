import { CheckCircle } from "lucide-react";

export const SuccessStep = ({ result, onNavigate }) => (
  <div className="text-center py-4">
    <div className="w-20 h-20 bg-emerald-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
      <CheckCircle className="w-10 h-10 text-emerald-500" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Shop Created!</h2>
    <p className="text-gray-500 dark:text-gray-400 mb-1">
      <span className="font-semibold text-emerald-600">{result?.shop?.name}</span> is ready to go.
    </p>
    {result?.members?.length > 0 && (
      <p className="text-sm text-gray-400 mb-2">
        {result.members.filter((m) => m.status === "created").length} team member(s) added.
      </p>
    )}
    <p className="text-sm text-gray-400 mb-8">
      You are now logged in as admin. Start adding products and processing sales.
    </p>
    <button
      onClick={onNavigate}
      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
    >
      Go to Dashboard
    </button>
  </div>
);

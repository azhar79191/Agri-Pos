export const ErrorBanner = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
      {error}
    </div>
  );
};

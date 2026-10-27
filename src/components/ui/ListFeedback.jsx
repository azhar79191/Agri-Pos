import Button from './Button';
export default function ListFeedback({ error, onRetry, empty, title, description, onClear }) {
  if (error) return <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"><h2 className="font-semibold">This list could not be loaded</h2><p className="text-sm">{error}</p><Button variant="secondary" onClick={onRetry}>Retry loading</Button></div>;
  if (!empty) return null;
  return <div className="space-y-3 p-8 text-center"><h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>{onClear && <Button variant="outline" onClick={onClear}>Clear filters</Button>}</div>;
}

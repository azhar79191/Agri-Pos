import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import LoadingState from './LoadingState';

export default function ReportState({ loading, error, onRetry, children }) {
  if (error) return <section role="alert" className="report-feedback">
    <span className="report-feedback__icon" aria-hidden="true"><AlertCircle size={21} /></span>
    <div><h2>This report could not be loaded</h2><p>{error}</p><p>Totals are hidden until the report is confirmed.</p></div>
    <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>Retry report</Button>
  </section>;
  if (loading) return <LoadingState label="Loading report" />;
  return children;
}

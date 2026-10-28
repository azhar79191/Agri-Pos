/** Shared loading feedback for pages, tables, cards and pending actions. */
export function LoadingIndicator({ className = '', ...props }) {
  return <span {...props} aria-hidden="true" className={`loading-indicator ${className}`}><i /><i /><i /></span>;
}
export function LoadingSkeleton({ className = '', ...props }) {
  return <div {...props} aria-hidden="true" className={`loading-skeleton ${className}`} />;
}
export default function LoadingState({ variant = 'section', label = 'Loading content', rows = 5, cols = 5, count = 3, className = '' }) {
  const columns = Math.max(1, Math.min(Number(cols) || 5, 10));
  const lines = Math.max(1, Math.min(Number(rows) || 5, 8));
  return <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className={`loading-state loading-state--${variant} ${className}`}>
    <div className="loading-state__label"><LoadingIndicator /><span>{label}</span></div>
    {variant === 'table' ? <div className="loading-table" aria-hidden="true">
      {Array.from({ length: lines + 1 }, (_, row) => <div key={row} className={`loading-table__row ${row === 0 ? 'loading-table__head' : ''}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, col) => <LoadingSkeleton key={col} className={`loading-table__cell loading-table__cell--${(row + col) % 3}`} />)}
      </div>)}
    </div> : variant === 'cards' || variant === 'stats' ? <div className={`loading-cards loading-cards--${variant}`} aria-hidden="true">
      {Array.from({ length: Math.max(1, Math.min(count, 8)) }, (_, index) => <div key={index} className="loading-card"><LoadingSkeleton className="loading-card__icon" /><div className="loading-card__copy"><LoadingSkeleton className="loading-card__title" /><LoadingSkeleton className="loading-card__line" />{variant === 'cards' && <LoadingSkeleton className="loading-card__line loading-card__line--short" />}</div></div>)}
    </div> : variant !== 'inline' && <div className="loading-state__preview" aria-hidden="true"><LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton /></div>}
  </div>;
}

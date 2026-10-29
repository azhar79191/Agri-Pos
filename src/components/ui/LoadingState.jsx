import { Sprout } from 'lucide-react';
import { PLATFORM_BRAND } from '../../constants/platformBrand';

/** Compact loading feedback for buttons and pending actions. */
export function LoadingIndicator({ className = '', ...props }) {
  return <span {...props} aria-hidden="true" className={`loading-indicator ${className}`}><i /><i /><i /></span>;
}
export function LoadingSkeleton({ className = '', ...props }) {
  return <div {...props} aria-hidden="true" className={`loading-skeleton ${className}`} />;
}

/** One loading design for pages, tables, cards and sections. */
export default function LoadingState({ variant = 'section', label = 'Loading content', className = '' }) {
  return <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className={`loading-state loading-state--${variant} ${className}`}>
    <div className="loading-page__mark" aria-hidden="true"><span className="loading-page__ring" /><Sprout size={30} strokeWidth={1.7} /></div>
    <div className="loading-page__copy">{variant === 'page' && <p className="loading-page__brand">{PLATFORM_BRAND.name}</p>}<p className="loading-state__label">{label}</p></div>
  </div>;
}

import React from 'react';

/** Page identity and actions share the same spacing, typography and icon treatment. */
export default function PageHeader({ title, description, icon: Icon, actions, children, className = '', titleId }) {
  return <header className={`page-header ${className}`}>
    <div className="page-header__row">
      <div className="page-header__identity">
        {Icon && <span className="page-header__icon" aria-hidden="true"><Icon size={19} strokeWidth={1.75} /></span>}
        <div className="min-w-0"><h1 id={titleId}>{title}</h1>{description && <p className="page-header__description">{description}</p>}</div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
    {children && <div className="page-header__details">{children}</div>}
  </header>;
}

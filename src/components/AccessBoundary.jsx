import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
export default function AccessBoundary({ children }) {
  const { pathname } = useLocation();
  const { state, actions } = useApp();
  const group = pathname.split('/')[1];
  const permission = { dashboard: 'dashboard:view', pos: 'pos:view', products: 'products:view', inventory: 'products:view', purchases: 'stock:view', stock: 'stock:view', customers: 'customers:view', invoices: 'invoices:view', sales: 'invoices:view', reports: 'reports:view', staff: 'users:view', users: 'users:view', recommendations: 'products:view', settings: 'settings:view', shops: 'settings:view', status: 'invoices:view' }[group];
  const ownerOnly = pathname === '/staff/roles' && state.currentUser?.role !== 'admin';
  if (ownerOnly || (permission && !actions.hasPermission(permission))) return <section className="card-base space-y-3 p-8" role="alert"><p className="workspace-eyebrow">Access restricted</p><h1 className="text-2xl font-semibold">This workspace is not included in your role</h1><p className="text-slate-500">Ask your shop administrator to review your access. Use the navigation to open an available module.</p></section>;
  return children;
}

import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useApp } from '../context/AppContext';
import { financialCommand } from '../api/financialCommand';
import RecordReference from './RecordReference';
import PendingInventoryOperations from './PendingInventoryOperations';
const cls = 'min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-900 dark:bg-slate-800 dark:text-white';
export default function PackWorkspace() {
  const { actions, state } = useApp();
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState(1);
  const [label, setLabel] = useState('pack');
  const [count, setCount] = useState(1);
  const [loose, setLoose] = useState(0);
  const [customer, setCustomer] = useState('');
  const [method, setMethod] = useState('Cash');
  const [paid, setPaid] = useState('');
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  useEffect(() => {
    let active = true; setProduct(null); setError(''); setResult('');
    if (productId) API.get(`/products/${productId}`).then(r => { if (active) { const p = r.data.data.product; setProduct(p); setSize(p.packSize || 1); setLabel(p.packLabel || 'pack'); } }).catch(() => { if (active) setError('Product could not be loaded. Retry by selecting it again.'); });
    return () => { active = false; };
  }, [productId, reload]);
  if (!actions.hasPermission('products:view')) return null;
  const quantity = Number(count) * (product?.packSize || 1) + Number(loose);
  const subtotal = quantity * (product?.price || 0);
  const total = Math.round(subtotal * (1 + Number(state.settings.taxRate || 0) / 100) * 100) / 100;
  const save = async () => {
    setBusy(true); setError('');
    try { await financialCommand('put', `/products/${productId}/pack`, { packSize: Number(size), packLabel: label, expectedPackSize: product.packSize || 1 }, { idField: 'clientOperationId', label: 'pack configuration' }); setReload(value => value + 1); }
    catch (e) { setError(e.response?.data?.message || e.message); } finally { setBusy(false); }
  };
  const checkout = async e => {
    e.preventDefault(); setBusy(true); setError(''); setResult('');
    const items = [];
    if (Number(count) > 0) items.push({ product: productId, quantity: Number(count) * (product.packSize || 1), packCount: Number(count), expectedPackSize: product.packSize || 1 });
    if (Number(loose) > 0) items.push({ product: productId, quantity: Number(loose) });
    try {
      const response = await financialCommand('post', '/invoices', { items, ...(customer ? { customer } : {}), paymentMethod: method, amountPaid: method === 'Cash' ? Number(paid) : 0, discount: 0 }, { idField: 'clientSaleId', label: 'pack sale' });
      setResult(`Invoice ${response.data.data.invoice.invoiceNumber} recorded. Review it in Invoices.`); setPaid('');
    } catch (err) { setError(err.response?.data?.message || err.message); } finally { setBusy(false); }
  };
  return <details className="rounded-xl border p-4"><summary className="min-h-11 cursor-pointer font-semibold">Packs and loose-unit checkout</summary><p className="my-3 text-sm">Inventory and prices are recorded in the product base unit. For loose quantities, use gram or ml as the base unit. Pack settings never reinterpret existing stock. Purchase returns use base units and base-unit cost.</p>
    <PendingInventoryOperations pathPrefix="/products" onRecovered={() => setReload(value => value + 1)} /><PendingInventoryOperations pathPrefix="/invoices" />
    <RecordReference model="Product" label="Pack product" value={productId} onChange={setProductId} disabled={busy} />
    {error && <p role="alert" className="text-red-700">{error}</p>}{result && <p role="status">{result} <a href="/invoices" className="underline">View invoices</a></p>}
    {product && <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="space-y-3"><p>{product.name}: {product.stock} {product.unit} in stock · {state.settings.currency} {product.price} per {product.unit}</p>{actions.hasPermission('products:edit') && <fieldset disabled={busy} className="space-y-3"><label className="block text-sm">Base units per pack<input type="number" min="1" max="1000000" step="1" className={cls} value={size} onChange={e => setSize(e.target.value)} /></label><label className="block text-sm">Pack label<input maxLength={40} className={cls} value={label} onChange={e => setLabel(e.target.value)} /></label><button type="button" onClick={save} className="min-h-11 rounded-lg border px-4">Save pack configuration</button></fieldset>}</section>
      {actions.hasPermission('pos:process') && <form onSubmit={checkout}><fieldset disabled={busy} className="space-y-3"><label className="block text-sm">Number of {product.packLabel || 'pack'}s ({product.packSize || 1} {product.unit} each)<input required type="number" min="0" step="1" className={cls} value={count} onChange={e => setCount(e.target.value)} /></label><label className="block text-sm">Additional loose {product.unit}<input required type="number" min="0" step="1" className={cls} value={loose} onChange={e => setLoose(e.target.value)} /></label><RecordReference model="Customer" label="Pack-sale customer" required={method === 'Credit'} value={customer} onChange={setCustomer} disabled={busy} /><label className="block text-sm">Payment method<select aria-label="Pack-sale payment method" className={cls} value={method} onChange={e => setMethod(e.target.value)}><option>Cash</option><option>Credit</option></select></label>{method === 'Cash' && <label className="block text-sm">Cash received<input required type="number" min="0" step="0.01" className={cls} value={paid} onChange={e => setPaid(e.target.value)} /></label>}<p className="text-sm">{quantity} base units · Estimated total including shop tax: {state.settings.currency} {total.toLocaleString()}. The server validates the final amount and available stock.</p><button disabled={quantity < 1} className="min-h-11 rounded-lg bg-emerald-700 px-4 text-white">Confirm pack sale</button></fieldset></form>}
    </div>}
  </details>;
}

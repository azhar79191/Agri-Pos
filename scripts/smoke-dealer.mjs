import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const schemas = JSON.parse(readFileSync(new URL('./fixtures/dealer-schemas.json', import.meta.url), 'utf8'));
async function selectValue(page, label, value) {
  const field = page.getByRole('combobox', { name: label, exact: true });
  await field.click();
  const listId = await field.getAttribute('aria-controls');
  await page.locator('[id=' + JSON.stringify(listId) + ']').locator('[role="option"][data-value=' + JSON.stringify(String(value)) + ']').click();
}

const origin = 'http://127.0.0.1:5181';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5181', '--strictPort'], { windowsHide: true, stdio: 'ignore', env: { ...process.env, VITE_API_BASE_URL: `${origin}/api` } });
let browser, page;
const errors = [], commands = [], records = [], orders = [], transfers = [];
const product = { _id: 'cccccccccccccccccccccccc', name: 'Dealer seed', sku: 'DEALER', category: 'Other', price: 100, stock: 50, reserved: 0, packSize: 2, packLabel: 'carton', unit: 'packet' };
const farmer = { _id: 'eeeeeeeeeeeeeeeeeeeeeeee', name: 'Dealer farmer' };
const supplier = { _id: 'dddddddddddddddddddddddd', name: 'Dealer supplier' };
const user = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Dealer owner', role: 'admin', permissions: [], shop: { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Dealer shop', isApproved: true, isActive: true, planStatus: 'active', currency: 'Rs.', taxRate: 0 } };
const offers = [{ _id: 'offer-one', productName: 'Dealer seed', unit: 'packet', manufacturer: 'Test manufacturer', available: 5, unitPrice: 80, expiresOn: '2099-12-31', published: true, owned: false, shop: { name: 'Other dealer' } }];
const pagination = { page: 1, pages: 1, total: 1 };
try {
  for (let i = 0; i < 100; i++) { try { if ((await fetch(origin)).ok) break; } catch {} await new Promise(resolve => setTimeout(resolve, 200)); }
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  await context.addInitScript(user => { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('posUser', JSON.stringify(user)); sessionStorage.setItem('token', 'synthetic-dealer-browser'); }, user);
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname.replace(/^\/api/, ''), method = request.method();
    if (url.origin === origin && request.resourceType() === 'document') return route.continue();
    if (!url.pathname.startsWith('/api/')) return url.origin === origin ? route.continue() : route.abort();
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? request.postDataJSON() : {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) commands.push({ path, body });
    let data = {};
    if (path === '/auth/profile') data = { user };
    else if (path === '/settings') data = { settings: { ...user.shop, shopName: user.shop.name } };
    else if (path === '/products') data = { products: [product], brands: [], categories: ['Other'], pagination };
    else if (path === `/products/${product._id}`) data = { product };
    else if (path.endsWith('/pack')) { Object.assign(product, body); data = { product }; }
    else if (path === '/customers') data = { customers: [farmer], pagination };
    else if (path === '/notifications') data = { notifications: [] };
    else if (path === '/dealer-records/schemas') data = { schemas: Object.fromEntries(Object.entries(schemas).map(([key, schema]) => [key, { ...schema, canEdit: true, canReview: true }])) };
    else if (path.startsWith('/dealer-records/lookup/')) {
      const model = path.split('/').at(-1), source = { Product: product, Customer: farmer, Supplier: supplier, User: user, Invoice: { _id: 'ffffffffffffffffffffffff', name: 'INV-TEST' } }[model];
      data = { items: [{ id: source._id, label: source.name }] };
    } else if (path.startsWith('/dealer-records/')) {
      const kind = path.split('/')[2];
      if (method === 'POST') { const item = { _id: `record-${records.length}`, kind, fields: body.fields, labels: { customer: farmer.name, assignee: user.name, product: product.name, alternative: 'Alternative seed', supplier: supplier.name }, status: 'open', version: 0 }; records.push(item); data = { item }; }
      else if (method === 'PATCH') { const item = records.find(item => item._id === path.split('/').at(-1)); Object.assign(item, body, { version: item.version + 1 }); data = { item }; }
      else data = { items: records.filter(item => item.kind === kind), pagination };
    } else if (path === '/customer-orders') {
      if (method === 'POST') { const item = { _id: `order-${orders.length}`, ...body, customer: farmer, taxRate: 0, status: 'draft', items: body.items.map((line, index) => ({ _id: `line-${index}`, ...line, name: product.name, unit: product.unit, unitPrice: product.price, delivered: 0 })) }; orders.push(item); data = { item }; }
      else data = { items: orders, pagination };
    } else if (path.startsWith('/customer-orders/')) { const item = orders.find(item => item._id === path.split('/')[2]); item.status = body.status; data = { item }; }
    else if (path === '/invoices' && method === 'POST') { if (body.orderId) orders.find(item => item._id === body.orderId).status = 'delivered'; data = { invoice: { invoiceNumber: 'INV-DEALER-1' } }; }
    else if (path === '/dealer-network/offers') data = { items: url.searchParams.get('mine') === 'true' ? offers.filter(item => item.owned) : offers, pagination };
    else if (path === '/dealer-network/transfers') {
      if (method === 'POST') { const item = { _id: 'transfer-one', ...body, productName: product.name, unit: product.unit, unitPrice: 80, direction: 'incoming', status: 'dispatched', dispatchReference: 'SELLER-DISPATCH' }; transfers.push(item); data = { item }; }
      else data = { items: transfers, pagination };
    } else if (path.startsWith('/dealer-network/transfers/')) { const item = transfers.find(item => item._id === path.split('/')[3]); item.status = body.status; data = { item }; }
    return route.fulfill({ json: { success: true, data } });
  });
  page = await context.newPage(); page.setDefaultTimeout(20000); page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/dealer-workspace`); await page.getByRole('heading', { name: 'Dealer workspace', exact: true }).waitFor();
  for (const [kind, schema] of Object.entries(schemas)) {
    await page.getByRole('button', { name: schema.title, exact: true }).click();
    for (const [key, field] of Object.entries(schema.fields)) {
      if (!field.required) continue;
      if (field.type === 'reference') { const source = { Product: product, Customer: farmer, Supplier: supplier, User: user }[field.model]; await selectValue(page, field.label, source._id); }
      else if (field.type === 'select') await selectValue(page, field.label, field.options[0]);
      else await page.getByLabel(field.label, { exact: true }).fill(field.type === 'date' ? '2099-12-31' : ['number', 'integer'].includes(field.type) ? key === 'ph' ? '7.2' : key === 'discount' || key === 'bonus' || key === 'taxRate' ? '0' : '10' : `${kind} ${key} fixture`);
    }
    await page.getByRole('button', { name: 'Save record', exact: true }).click();
    await page.getByText('Record saved.', { exact: true }).waitFor();
    assert(records.some(record => record.kind === kind));
  }
  await page.getByText('Packs and loose-unit checkout', { exact: true }).click();
  await selectValue(page, 'Pack product', product._id);
  await page.locator('details').filter({ has: page.locator('summary', { hasText: 'Packs and loose-unit checkout' }) }).getByLabel('Base units per pack', { exact: true }).fill('12');
  await page.getByRole('button', { name: 'Save pack configuration', exact: true }).click();
  await page.getByLabel('Number of cartons (12 packet each)').waitFor();
  await page.getByLabel('Cash received', { exact: true }).fill('1200');
  await page.getByRole('button', { name: 'Confirm pack sale', exact: true }).click();
  await page.getByText(/Invoice INV-DEALER-1 recorded/).waitFor();
  assert(commands.some(command => command.path === '/invoices' && command.body.items[0].packCount === 1 && command.body.items[0].quantity === 12));
  await page.getByText('Packs and loose-unit checkout', { exact: true }).click();
  await page.getByText('Customer quotes, reservations and delivery', { exact: true }).click();
  await page.getByLabel('Quote title').fill('Wheat season quote');
  await selectValue(page, 'Order customer', farmer._id);
  await selectValue(page, 'Reserved product', product._id);
  await page.getByLabel('Quote valid through (UTC)').fill('2099-12-31');
  await page.getByRole('button', { name: 'Create quote', exact: true }).click();
  await page.getByRole('button', { name: 'Reserve stock', exact: true }).click();
  await page.getByRole('button', { name: 'Record delivery and invoice', exact: true }).click();
  await page.locator('details').filter({ has: page.locator('summary', { hasText: 'Customer quotes, reservations and delivery' }) }).getByLabel('Cash received', { exact: true }).fill('100');
  await page.getByRole('button', { name: 'Confirm delivery invoice', exact: true }).click();
  await page.getByText('Delivery invoiced: INV-DEALER-1', { exact: true }).waitFor();
  assert.equal(orders[0].status, 'delivered');
  await page.getByText('Customer quotes, reservations and delivery', { exact: true }).click();
  await page.getByText('Dealer stock-transfer network', { exact: true }).click();
  await page.getByRole('button', { name: 'Request this stock', exact: true }).click();
  await selectValue(page, 'Matching local receiving product', product._id);
  await page.getByRole('button', { name: 'Submit stock request', exact: true }).click();
  await page.getByText('Network action recorded.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Transfer history', exact: true }).click();
  await page.getByLabel('Dispatch, receipt or cancellation reference').fill('RECEIVED-1');
  await page.getByRole('button', { name: 'Confirm stock received', exact: true }).click();
  await page.getByText('Network action recorded.', { exact: true }).waitFor();
  assert.equal(transfers[0].status, 'received');
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/dealer-workspace-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Dealer workspace fits a mobile viewport');
  await page.screenshot({ path: 'artifacts/dealer-workspace-mobile.png', fullPage: true, animations: 'disabled' });
  assert.deepEqual(errors, []);
  console.log('Dealer browser smoke passed: all five record forms, pack configuration/checkout, quote/reserve/deliver, explicit stock offers/request/receipt and mobile width. Synthetic data only.');
} catch (error) {
  if (page) { console.error(errors, commands.slice(-4), (await page.locator('body').innerText()).slice(-1600)); await page.screenshot({ path: 'artifacts/dealer-smoke-failure.png', fullPage: true }).catch(() => {}); }
  throw error;
} finally { if (browser) await browser.close(); server.kill(); }

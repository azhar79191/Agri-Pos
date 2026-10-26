import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:5179';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5179', '--strictPort'], { windowsHide: true, stdio: 'ignore' });
let browser, page;
const pageErrors = [];
try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Wait for local Vite startup. */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const user = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'Test Cashier', role: 'admin', permissions: [],
    shop: { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'Test Agri Shop', isApproved: true, isActive: true, planStatus: 'active', taxRate: 0, currency: 'Rs.' } };
  await context.addInitScript(user => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('posUser', JSON.stringify(user));
    sessionStorage.setItem('token', 'isolated-browser-fixture');
  }, user);
  const apiRequests = [];
  let stock = 5;
  const stockAttempts = [];
  const supplier = { _id: 'dddddddddddddddddddddddd', name: 'Test Supplier', outstanding: 120, creditBalance: 0, totalPurchases: 120, paymentTerms: 'Net 30' };
  let brandSettings = { shopName: 'Test Agri Shop', brandName: '', brandTagline: '', brandColor: '#047857', brandLogo: '', emailFooter: 'Thank you', actionEmailsEnabled: false };
  const farmerSeasons = [], farmerTasks = [], farmerCommands = [];
  const farmer = { _id: 'eeeeeeeeeeeeeeeeeeeeeeee', name: 'Test Farmer', phone: '03000000000' };
  const supplierPayments = [];
  const supplierMovements = [{ _id: 'receipt-fixture', reference: 'GRN-TEST', kind: 'receipt', value: 120, outstandingAfter: 120, creditAfter: 0, createdAt: new Date().toISOString() }];
  const fixtureProduct = () => ({ _id: 'cccccccccccccccccccccccc', name: 'Test Seed', sku: 'SEED', category: 'Other', price: 100, stock, unit: 'packet' });
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin && route.request().resourceType() === 'document') return route.continue();
    const path = url.pathname.replace(/^\/api/, '');
    let data;
    if (path === '/auth/profile') data = { user };
    else if (path === '/settings/email-status') data = { workerEnabled: false, providerConfigured: false, jobs: [] };
    else if (path === '/settings') {
      if (route.request().method() === 'PUT') { Object.assign(brandSettings, route.request().postDataJSON()); Object.assign(user.shop, brandSettings); }
      data = { settings: brandSettings };
    }
    else if (path === '/products') {
      apiRequests.push(url.searchParams.get('category'));
      data = { products: [fixtureProduct()], brands: [], categories: ['Other'], pagination: { pages: 1 } };
    } else if (path === '/customers') data = { customers: [farmer] };
    else if (path.startsWith('/farmer-workspace/')) {
      const isSeason = path.endsWith('/seasons');
      const records = isSeason ? farmerSeasons : farmerTasks;
      if (route.request().method() === 'POST') {
        const command = route.request().postDataJSON(); farmerCommands.push(command);
        const item = { ...command, _id: `farmer-${records.length}`, customer: farmer, status: 'open' };
        records.push(item); data = { item };
      } else if (route.request().method() === 'PATCH') {
        const command = route.request().postDataJSON(); farmerCommands.push(command);
        const item = farmerTasks.find(item => path.endsWith(`/${item._id}`));
        Object.assign(item, command); data = { item };
      } else {
        const items = records.filter(item => isSeason || item.status === url.searchParams.get('status'));
        data = { items, pagination: { page: 1, pages: 1, total: items.length } };
      }
    }
    else if (path === '/sales-reps') data = { reps: [] };
    else if (path === '/bundles') data = { bundles: [] };
    else if (path === '/notifications') data = { notifications: [] };
    else if (path === '/stock/levels') data = { products: [fixtureProduct()] };
    else if (path === '/stock/logs') data = { logs: [] };
    else if (path === '/stock/alerts') data = { lowStock: { products: [] }, outOfStock: { products: [] } };
    else if (path === '/stock/adjust' && route.request().method() === 'POST') {
      const command = route.request().postDataJSON();
      stockAttempts.push(command);
      if (stockAttempts.length === 1) return route.abort('failed');
      const previousStock = stock;
      stock = command.quantity;
      data = { product: { ...fixtureProduct(), previousStock, newStock: stock }, log: { _id: 'stock-log-fixture' } };
    } else if (path === '/suppliers') data = { suppliers: [supplier], pagination: { page: 1, pages: 1, total: 1 } };
    else if (path === `/suppliers/${supplier._id}/payment` && route.request().method() === 'POST') {
      const command = route.request().postDataJSON();
      supplierPayments.push(command);
      supplier.outstanding -= command.amount;
      supplierMovements.unshift({ _id: 'payment-fixture', reference: 'PAY-TEST', kind: 'payment', method: command.method, value: command.amount, outstandingAfter: supplier.outstanding, creditAfter: 0, createdAt: new Date().toISOString() });
      data = { supplier, reference: 'PAY-TEST' };
    } else if (path === `/suppliers/${supplier._id}/ledger`) data = { entries: supplierMovements, pagination: { page: 1, pages: 1, total: supplierMovements.length } };
    else if (path === '/invoices' && route.request().method() === 'POST') {
      return route.fulfill({ status: 409, json: { success: false, message: 'Insufficient stock — browser fixture' } });
    } else if (url.origin !== origin) return route.abort();
    else return route.continue();
    return route.fulfill({ json: { success: true, data } });
  });
  page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => pageErrors.push(error.message));
  await mkdir('artifacts', { recursive: true });
  await page.goto(`${origin}/pos`);
  await page.getByRole('heading', { name: 'Point of Sale', exact: true }).waitFor();
  await page.waitForFunction(() => !document.body.textContent.includes('Loading catalog'));
  const categoryRequest = page.waitForRequest(request => new URL(request.url()).searchParams.get('category') === 'Other');
  await page.getByRole('button', { name: 'Other', exact: true }).click();
  await categoryRequest;
  await page.getByRole('button', { name: 'Add', exact: true }).last().waitFor();
  await page.waitForFunction(() => !document.body.textContent.includes('Loading catalog'));
  assert(apiRequests.includes('Other'), 'Category changes must reach server search');
  await page.getByRole('button', { name: 'Add', exact: true }).last().click();
  await page.getByRole('button', { name: 'Exact', exact: true }).click();
  await mkdir('artifacts', { recursive: true });
  const desktopAction = await page.getByRole('button', { name: 'Confirm cash sale', exact: true }).boundingBox();
  assert(desktopAction && desktopAction.y >= 0 && desktopAction.y + desktopAction.height <= 1000, 'Desktop payment action must remain in the viewport');
  await page.screenshot({ path: 'artifacts/pos-desktop.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Confirm cash sale', exact: true }).click();
  await page.getByText('Insufficient stock — browser fixture', { exact: true }).waitFor();
  assert.equal(await page.getByText('Test Seed', { exact: true }).count() >= 2, true, 'Rejected checkout must retain the cart');
  assert.equal(await page.getByText('Sale completed!', { exact: true }).count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /^Cart/ }).first().click();
  await page.getByRole('button', { name: 'Confirm cash sale', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Mobile document must not overflow horizontally');
  const mobileAction = await page.getByRole('button', { name: 'Confirm cash sale', exact: true }).boundingBox();
  assert(mobileAction && mobileAction.y >= 0 && mobileAction.y + mobileAction.height <= 844, 'Mobile payment action must remain in the viewport');
  await page.screenshot({ path: 'artifacts/pos-mobile.png', fullPage: true, animations: 'disabled' });
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Connection required', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Connection required', exact: true }).isDisabled(), true);
  await context.setOffline(false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/stock`);
  await page.getByRole('heading', { name: 'Stock Management', exact: true }).waitFor();
  await page.getByRole('combobox').first().selectOption('cccccccccccccccccccccccc');
  await page.getByRole('button', { name: 'Set Level', exact: true }).click();
  await page.getByPlaceholder('Enter quantity', { exact: true }).fill('0');
  await page.getByPlaceholder('Enter reason for adjustment', { exact: true }).fill('Physical count');
  await page.getByRole('button', { name: 'Apply Adjustment', exact: true }).click();
  await page.getByRole('button', { name: 'Recover original change', exact: true }).click();
  await page.getByText('Original change confirmed. It has not been applied twice.', { exact: true }).waitFor();
  assert.equal(stockAttempts.length, 2);
  assert.deepEqual(stockAttempts[0], stockAttempts[1], 'Recovery must reuse the zero count, original expected stock, and identifier');
  assert.equal(stockAttempts[1].expectedStock, 5);
  assert.equal(stock, 0);
  await page.screenshot({ path: 'artifacts/stock-desktop.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/purchases/suppliers`);
  await page.getByRole('button', { name: 'Record payment', exact: true }).click();
  const paymentDialog = page.getByRole('dialog');
  await paymentDialog.getByLabel('Amount', { exact: true }).fill('70');
  await paymentDialog.getByRole('button', { name: 'Record payment', exact: true }).click();
  await paymentDialog.waitFor({ state: 'hidden' });
  assert.equal(supplierPayments.length, 1);
  assert.equal(supplierPayments[0].amount, 70);
  assert(supplierPayments[0].clientOperationId);
  await page.getByText('Rs. 50.00', { exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'View balance movements', exact: true }).click();
  await page.getByRole('cell', { name: 'PAY-TEST', exact: true }).waitFor();
  for (let press = 0; press < 5; press++) await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')), true, 'Keyboard focus stays inside the supplier history dialog');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Mobile supplier dialog must not overflow the document');
  await page.screenshot({ path: 'artifacts/supplier-ledger-mobile.png', fullPage: true, animations: 'disabled' });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.goto(`${origin}/customers/workspace`);
  await page.getByRole('heading', { name: 'Farmer workspace', exact: true }).waitFor();
  await page.getByLabel('Customer', { exact: true }).selectOption(farmer._id);
  await page.getByLabel('Crop', { exact: true }).fill('Wheat');
  await page.getByLabel('Season name', { exact: true }).fill('Rabi 2026');
  await page.getByLabel('Cultivated area', { exact: true }).fill('2.5');
  await page.getByLabel('Sowing date', { exact: true }).fill('2026-10-27');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Save crop season', exact: true }).click();
  await page.getByRole('heading', { name: /^Wheat.*Rabi 2026$/ }).waitFor();
  assert.equal(farmerSeasons.length, 1);
  assert.equal(farmerCommands[0].area, 2.5);
  assert.equal(farmerCommands[0].consent, true);
  assert(farmerCommands[0].clientOperationId);
  await page.getByRole('button', { name: 'Follow-up inbox', exact: true }).click();
  await page.getByLabel('Customer', { exact: true }).selectOption(farmer._id);
  await page.getByLabel('Follow-up title', { exact: true }).fill('Discuss next crop visit');
  await page.getByLabel('Due date', { exact: true }).fill('2026-11-01');
  await page.getByRole('button', { name: 'Create follow-up', exact: true }).click();
  await page.getByRole('heading', { name: 'Discuss next crop visit', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit or reschedule', exact: true }).click();
  await page.getByLabel('Rescheduled due date', { exact: true }).fill('2026-11-03');
  await page.getByLabel('Contact notes', { exact: true }).fill('Farmer requested Tuesday');
  await page.getByRole('button', { name: 'Save follow-up', exact: true }).click();
  await page.getByText('Farmer requested Tuesday', { exact: true }).waitFor();
  assert.equal(farmerTasks[0].dueDate, '2026-11-03');
  await page.getByRole('button', { name: 'Mark completed', exact: true }).click();
  await page.getByLabel('Task status', { exact: true }).selectOption('completed');
  await page.getByRole('button', { name: 'Reopen task', exact: true }).waitFor();
  assert.equal(farmerTasks[0].status, 'completed');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Farmer workspace must fit mobile width');
  await page.screenshot({ path: 'artifacts/farmer-workspace-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/farmer-workspace-desktop.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/settings`);
  await page.getByRole('button', { name: /Branding & Emails/ }).click();
  await page.getByLabel('Brand name', { exact: true }).fill('Green Fields');
  await page.getByLabel('Tagline', { exact: true }).fill('Your crop partner');
  await page.getByLabel('Email footer', { exact: true }).fill('Thank you for choosing Green Fields');
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Branding and email preferences saved. Delivery also requires the server email worker and provider configuration.', { exact: true }).waitFor();
  assert.equal(brandSettings.brandName, 'Green Fields');
  assert.equal(await page.title(), 'Green Fields');
  assert.equal(brandSettings.actionEmailsEnabled, false);
  await page.screenshot({ path: 'artifacts/branding-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Brand settings must fit mobile width');
  await page.screenshot({ path: 'artifacts/branding-mobile.png', fullPage: true, animations: 'disabled' });
  assert.deepEqual(pageErrors, []);
  console.log('Browser smoke passed: POS desktop/mobile, offline guard, zero stock-count recovery, supplier payment, mobile supplier ledger, dialog keyboard focus, farmer seasons, and follow-up create/reschedule/complete, and branding settings.');
} catch (error) {
  if (page) {
    await mkdir('artifacts', { recursive: true });
    await page.screenshot({ path: 'artifacts/smoke-failure.png', fullPage: true, animations: 'disabled' }).catch(() => {});
    console.error('Browser diagnostics:', pageErrors, (await page.locator('body').innerText().catch(() => '')).slice(-1800));
  }
  throw error;
} finally {
  if (browser) await browser.close();
  server.kill();
}

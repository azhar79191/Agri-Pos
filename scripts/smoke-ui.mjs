import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:5179';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5179', '--strictPort'], { windowsHide: true, stdio: 'ignore' });
let browser, page;
const pageErrors = [];
async function pickOption(control, value) {
  if (await control.evaluate(element => element.tagName === 'SELECT')) return control.selectOption(value);
  await control.click();
  await page.locator(`[role="option"][data-value="${value}"]`).click();
}
async function setCompanyAppearance(theme) {
  await page.goto(`${origin}/settings`);
  await page.getByRole('heading', { name: 'Brand studio', exact: true }).waitFor();
  await pickOption(page.getByLabel('Company appearance', { exact: true }), theme);
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Company settings are up to date', { exact: true }).waitFor();
  await page.goto(`${origin}/staff/roles`);
  await page.getByRole('heading', { name: 'Roles and access', exact: true }).waitFor();
}
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
    if (window.top !== window) return;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('posUser', JSON.stringify(user));
    sessionStorage.setItem('token', 'isolated-browser-fixture');
  }, user);
  const apiRequests = [];
  const directorySearches = [];
  let directoryFailure = true;
  let marginFailure = true;
  let stock = 5;
  const stockAttempts = [];
  const supplier = { _id: 'dddddddddddddddddddddddd', name: 'Test Supplier', outstanding: 120, creditBalance: 0, totalPurchases: 120, paymentTerms: 'Net 30' };
  const accessRoles = [], staffRole = { _id: 'ffffffffffffffffffffffff', name: 'Inventory staff', email: 'staff@example.test', role: 'cashier' };
  const roleCommands = [];
  const logoImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6y8AAAAASUVORK5CYII=';
  let brandSettings = { shopName: 'Test Agri Shop', brandName: '', brandTagline: '', brandColor: '#047857', brandLogo: '', emailFooter: 'Thank you', actionEmailsEnabled: false };
  const farmerSeasons = [], farmerTasks = [], farmerCommands = [];
  const farmer = { _id: 'eeeeeeeeeeeeeeeeeeeeeeee', name: 'Test Farmer', phone: '03000000000' };
  const assistantConnections = [];
  let assistantFailure = true;
  const supplierPayments = [];
  const supplierMovements = [{ _id: 'receipt-fixture', reference: 'GRN-TEST', kind: 'receipt', value: 120, outstandingAfter: 120, creditAfter: 0, createdAt: new Date().toISOString() }];
  const fixtureProduct = () => ({ _id: 'cccccccccccccccccccccccc', name: 'Test Seed', sku: 'SEED', category: 'Other', price: 100, stock, unit: 'packet' });
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin && route.request().resourceType() === 'document') return route.continue();
    const path = url.pathname.replace(/^\/api/, '');
    let data;
    if (path === '/assistant/tools') data = { tools: [{ name: 'stock_alerts', description: 'Read company stock alerts' }], aiPlanningEnabled: false };
    else if (path === '/assistant/chat') {
      if (assistantFailure) { assistantFailure = false; return route.fulfill({ status: 503, json: { success: false, message: 'Assistant temporarily unavailable' } }); }
      data = { tool: 'stock_alerts', message: 'Company stock alerts', generatedAt: new Date().toISOString(), data: { products: [{ name: 'Assistant seed fixture', stock: 2, unit: 'packet' }] } };
    }
    else if (path === '/assistant/connections') {
      if (route.request().method() === 'POST') { assistantConnections.push({ _id: 'connection-fixture', label: route.request().postDataJSON().label, expiresAt: new Date(Date.now() + 3600000).toISOString() }); data = { token: 'synthetic-browser-token', connection: assistantConnections[0] }; }
      else data = { connections: assistantConnections };
    }
    else if (path === '/assistant/connections/connection-fixture') { assistantConnections[0].revokedAt = new Date().toISOString(); data = {}; }
    else if (path === '/auth/profile') data = { user };
    else if (path === '/roles') {
      if (route.request().method() === 'POST') { const command = route.request().postDataJSON(); roleCommands.push(command); accessRoles.push({ ...command, _id: 'role-fixture' }); data = { role: accessRoles.at(-1) }; }
      else data = { roles: accessRoles, users: [staffRole], permissions: ['dashboard:view', 'products:view', 'products:edit'] };
    }
    else if (path === '/roles/role-fixture/assign') { staffRole.customRoleId = 'role-fixture'; data = { userId: staffRole._id }; }
    else if (path === '/settings/logo') {
      const raw = route.request().postDataBuffer().toString();
      const settings = raw.match(/name="settings"\r\n\r\n([^\r\n]+)/);
      assert(settings, 'Logo and settings must be submitted together');
      Object.assign(brandSettings, JSON.parse(settings[1]), { brandLogo: `data:image/png;base64,${logoImage}` });
      Object.assign(user.shop, brandSettings); data = { settings: brandSettings };
    }
    else if (path === '/settings/email-check') data={success:true,verified:false,provider:'sendgrid-api',message:'API configuration is present. Verify the sender before sending.'};
    else if(path === '/settings/email-preview') data={subject:'Test shop receipt',html:'<html><body><h1>Company email preview</h1></body></html>'};
    else if (path === '/settings/email-status') data = { workerEnabled: false, providerConfigured: false, jobs: [] };
    else if (path === '/settings') {
      if (route.request().method() === 'PUT') { Object.assign(brandSettings, route.request().postDataJSON()); Object.assign(user.shop, brandSettings); }
      data = { settings: brandSettings };
    }
    else if (path === '/products') {
      apiRequests.push(url.searchParams.get('category'));
      directorySearches.push(url.searchParams.get('search'));
      if (url.searchParams.get('search') === 'unavailable' && directoryFailure) { directoryFailure = false; return route.fulfill({ status: 503, json: { success: false, message: 'Directory unavailable - browser fixture' } }); }
      const found = url.searchParams.get('search') === 'REMOTE-SKU' ? { ...fixtureProduct(), name: 'Remote catalog match', sku: 'REMOTE-SKU' } : fixtureProduct();
      data = { products: [found], brands: [], categories: ['Other'], pagination: { page: 1, pages: 1, total: 1 } };
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
    } else if(path==='/reports/margin') {
      if(marginFailure){return route.fulfill({status:503,json:{success:false,message:'Report temporarily unavailable - browser fixture'}});}
      data={categories:[{category:'Verified report fixture',revenue:1200,profit:300,margin:25}]};
    } else if (url.origin !== origin) return route.abort();
    else return route.continue();
    return route.fulfill({ json: { success: true, data } });
  });
  page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on('pageerror', error => pageErrors.push(error.message));
  await mkdir('artifacts', { recursive: true });
  await page.goto(`${origin}/assistant`);
  await page.getByRole('heading', { name: 'Business assistant', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Which items have low stock?' }).click();
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Assistant temporarily unavailable' }).waitFor();
  assert.equal(await page.getByLabel('Ask about your business').inputValue(), 'Which items have low stock?');
  await page.getByRole('button', { name: 'Ask assistant', exact: true }).click();
  await page.getByRole('cell', { name: 'Assistant seed fixture' }).waitFor();
  await page.getByLabel('Connection name', { exact: true }).fill('Browser acceptance');
  await page.getByRole('checkbox', { name: /I understand/ }).check();
  await page.getByRole('button', { name: 'Create one-hour connection' }).click();
  await page.getByLabel('New connection token', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Hide token' }).click();
  assert.equal(await page.getByLabel('New connection token', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Revoke', exact: true }).click();
  await page.getByText('Revoked', { exact: true }).waitFor();
  await page.screenshot({ path: 'artifacts/assistant-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Assistant must fit mobile width');
  await page.screenshot({ path: 'artifacts/assistant-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/recommendations/dosage`);
  await page.getByRole('heading', { name: 'Calculate from a product label' }).waitFor();
  await page.getByLabel('Product and formulation').fill('Synthetic label fixture');
  await page.getByLabel('Label reference or registration number').fill('TEST-REFERENCE');
  await page.getByLabel('Field area', { exact: true }).fill('2.5');
  await page.getByLabel('Rate printed on label').fill('100');
  await page.getByRole('checkbox', { name: /I checked/ }).check();
  await page.getByRole('button', { name: 'Calculate label quantity' }).click();
  await page.getByRole('heading', { name: 'Calculated quantity: 250 ml' }).waitFor();
  await page.getByLabel('Field area', { exact: true }).fill('3');
  assert.equal(await page.getByRole('heading', { name: /Calculated quantity:/ }).count(), 0, 'Editing inputs must invalidate the old total');
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
  await page.locator('.workspace-main').evaluate(element => { element.scrollTop = 0; });
  const desktopAction = await page.getByRole('button', { name: 'Confirm cash sale', exact: true }).boundingBox();
  assert(desktopAction, 'Desktop payment action must be present');
  assert.equal(await page.locator('.pos-cart').evaluate(element => getComputedStyle(element).maxHeight), 'none', 'Receipt grows with its contents');
  assert.equal(await page.getByRole('heading', { name: 'Order Summary', exact: true }).isVisible(), true);
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
  await pickOption(page.getByRole('combobox').first(), 'cccccccccccccccccccccccc');
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
  await pickOption(page.getByLabel('Customer', { exact: true }), farmer._id);
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
  await pickOption(page.getByLabel('Customer', { exact: true }), farmer._id);
  await page.getByLabel('Follow-up title', { exact: true }).fill('Discuss next crop visit');
  await page.getByLabel('Due date', { exact: true }).fill('2026-11-01');
  await page.getByRole('button', { name: 'Create follow-up', exact: true }).click();
  await page.getByRole('heading', { name: 'Discuss next crop visit', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit or reschedule', exact: true }).click();
  await page.getByLabel('Rescheduled due date', { exact: true }).fill('2026-11-03');
  await page.getByLabel('Contact notes', { exact: true }).fill('Farmer requested Tuesday');
  await page.getByRole('button', { name: 'Save follow-up', exact: true }).click();
  await page.getByText('crop visit · Due 2026-11-03 · open', { exact: true }).waitFor();
  assert.equal(farmerTasks[0].dueDate, '2026-11-03');
  await page.getByRole('button', { name: 'Mark completed', exact: true }).click();
  await pickOption(page.getByLabel('Task status', { exact: true }), 'completed');
  await page.getByRole('button', { name: 'Reopen task', exact: true }).waitFor();
  assert.equal(farmerTasks[0].status, 'completed');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Farmer workspace must fit mobile width');
  await page.screenshot({ path: 'artifacts/farmer-workspace-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/farmer-workspace-desktop.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/settings`);
  await page.getByRole('button', { name: /Company Branding/ }).click();
  await page.getByLabel('Brand name', { exact: true }).fill('Green Fields');
  await page.getByLabel('Tagline', { exact: true }).fill('Your crop partner');
  await page.getByLabel('Email footer', { exact: true }).fill('Thank you for choosing Green Fields');
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Company identity, global appearance and email preferences saved. Email delivery also requires valid server provider settings.', { exact: true }).waitFor();
  assert.equal(brandSettings.brandName, 'Green Fields');
  assert.equal(await page.title(), 'Green Fields');
  assert.equal(brandSettings.actionEmailsEnabled, false);
  await page.getByLabel('Brand name', { exact: true }).fill('Discard this draft');
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  assert.equal(await page.getByLabel('Brand name', { exact: true }).inputValue(), 'Green Fields');
  await page.getByLabel('Upload company logo', { exact: true }).setInputFiles({ name: 'company.png', mimeType: 'image/png', buffer: Buffer.from(logoImage, 'base64') });
  await page.getByText('New logo ready. It will be uploaded when you save.', { exact: true }).waitFor();
  assert.equal(brandSettings.brandLogo, '');
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Company settings are up to date', { exact: true }).waitFor();
  assert(brandSettings.brandLogo.startsWith('data:image/png;base64,'));
  const companyHeader = page.getByLabel('Company identity', { exact: true });
  assert.equal(await companyHeader.getByRole('img').getAttribute('src'), brandSettings.brandLogo);
  assert.equal(await page.evaluate(() => document.querySelector('link[rel="icon"]').getAttribute('href')), brandSettings.brandLogo);
  await page.reload();
  await page.getByRole('button', { name: /Company Branding/ }).click();
  await page.getByRole('heading', { name: 'Brand studio', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Company identity', { exact: true }).getByRole('img').getAttribute('src'), brandSettings.brandLogo);
  await page.setViewportSize({ width: 1024, height: 900 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Company header must fit a small desktop viewport');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/company-brand-studio-desktop.png', fullPage: true, animations: 'disabled' });
  await page.screenshot({ path: 'artifacts/branding-desktop.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Brand settings must fit mobile width');
  await page.screenshot({ path: 'artifacts/company-brand-studio-mobile.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Rose company theme', exact: true }).click();
  await pickOption(page.getByLabel('Company appearance', { exact: true }), 'dark');
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Company settings are up to date', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--pos-primary')), '#f43f5e');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
  await page.reload();
  await page.getByRole('heading', { name: 'Brand studio', exact: true }).waitFor();
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
  await page.screenshot({ path: 'artifacts/theme-dark-mobile.png', fullPage: true, animations: 'disabled' });
  await page.evaluate(() => localStorage.setItem('appearance:color:other-shop:other-user', '#123456'));
  await page.getByLabel('Brand accent', { exact: true }).fill('#047857');
  await pickOption(page.getByLabel('Company appearance', { exact: true }), 'light');
  await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
  await page.getByText('Company settings are up to date', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('appearance:color:other-shop:other-user')), '#123456', 'Saving appearance must not clear another company account appearance');
  assert.equal(await page.evaluate(() => document.documentElement.style.getPropertyValue('--pos-primary')), '#047857');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), false);
  await page.goto(`${origin}/staff/roles`);
  await page.getByRole('heading', { name: 'Roles and access', exact: true }).waitFor();
  await page.getByLabel('Role name', { exact: true }).fill('Inventory assistant');
  await page.getByRole('group', { name: 'products', exact: true }).getByLabel('view', { exact: true }).check();
  await page.getByRole('button', { name: 'Create role', exact: true }).click();
  await page.getByRole('heading', { name: 'Inventory assistant', exact: true }).waitFor();
  assert.deepEqual(roleCommands[0].permissions, ['products:view']);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel('Staff member', { exact: true }).click();
  await page.getByRole('listbox', { name: 'Staff member', exact: true }).waitFor();
  const lightOption = await page.getByRole('option', { name: /Inventory staff/ }).evaluate(element => getComputedStyle(element).backgroundColor);
  await page.screenshot({ path: 'artifacts/custom-select-light.png', fullPage: true, animations: 'disabled' });
  await page.keyboard.press('Escape');
  await setCompanyAppearance('dark');
  await page.getByLabel('Staff member', { exact: true }).click();
  const darkOption = await page.getByRole('option', { name: /Inventory staff/ }).evaluate(element => getComputedStyle(element).backgroundColor);
  assert.notEqual(lightOption, darkOption, 'Custom option backgrounds follow appearance mode');
  await page.screenshot({ path: 'artifacts/custom-select-dark.png', fullPage: true, animations: 'disabled' });
  await page.keyboard.press('Escape');
  await setCompanyAppearance('light');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Staff member', { exact: true }).click();
  const menuBounds = await page.getByRole('listbox', { name: 'Staff member', exact: true }).boundingBox();
  assert(menuBounds && menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 390 && menuBounds.y >= 0 && menuBounds.y + menuBounds.height <= 844, 'Custom menu stays within mobile viewport');
  await page.keyboard.press('Escape');
  await pickOption(page.getByLabel('Staff member', { exact: true }), staffRole._id);
  await pickOption(page.getByLabel('Access role', { exact: true }), 'role-fixture');
  await page.getByRole('button', { name: 'Assign role', exact: true }).click();
  await page.getByRole('button', { name: 'Restore standard cashier role', exact: true }).waitFor();
  assert.equal(staffRole.customRoleId, 'role-fixture');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Role editor must fit mobile width');
  await page.screenshot({ path: 'artifacts/roles-mobile.png', fullPage: true, animations: 'disabled' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/roles-desktop.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/products`);
  await page.getByRole('heading', { name: 'Products', exact: true }).waitFor();
  await page.getByLabel('Search products', { exact: true }).fill('REMOTE-SKU');
  await page.getByText('Remote catalog match', { exact: true }).waitFor();
  assert(directorySearches.includes('REMOTE-SKU'), 'Directory search must reach the backend');
  await page.getByLabel('Search products', { exact: true }).fill('unavailable');
  await page.getByRole('heading', { name: 'This list could not be loaded', exact: true }).waitFor();
  assert.equal(await page.getByText('No matching products', { exact: true }).count(), 0, 'API failures must not look like empty searches');
  await page.getByRole('button', { name: 'Retry loading', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Test Seed', exact: true }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Product directory must fit mobile width');
  await page.getByLabel('Select Test Seed', { exact: true }).check();
  await page.getByRole('region', { name: 'Selected records actions', exact: true }).waitFor();
  const bulkBounds = await page.getByRole('region', { name: 'Selected records actions', exact: true }).boundingBox();
  assert(bulkBounds && bulkBounds.x >= 0 && bulkBounds.x + bulkBounds.width <= 390, 'Every bulk action must remain inside the mobile viewport');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Bulk toolbar must fit mobile width');
  await page.screenshot({ path: 'artifacts/products-directory-mobile.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/customers`);
  await page.getByRole('heading', { name: 'Customers', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit Test Farmer', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Add Customer', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Full Name').fill('New farmer');
  await page.getByRole('dialog').getByLabel('Address', { exact: true }).fill('Village address');
  await page.keyboard.press('Escape');
  await page.getByRole('group', { name: 'Unsaved changes' }).waitFor();
  await page.screenshot({ path: 'artifacts/shared-form-mobile.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
  assert.equal(await page.getByRole('dialog').getByLabel('Full Name').inputValue(), 'New farmer');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'artifacts/shared-form-desktop.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Customer directory must fit mobile width');
  await page.screenshot({ path: 'artifacts/customers-directory-mobile.png', fullPage: true, animations: 'disabled' });
  await page.goto(`${origin}/reports/margin`);
  await page.getByRole('heading', {name:'This report could not be loaded',exact:true}).waitFor();
  assert.equal(await page.getByText('No margin data available. Make some sales first.',{exact:true}).count(),0,'Failed reports must not appear empty');
  await page.screenshot({path:'artifacts/report-error-mobile.png',fullPage:true,animations:'disabled'});
  marginFailure=false;
  await page.getByRole('button',{name:'Retry report',exact:true}).click();
  await page.getByText('Verified report fixture',{exact:true}).waitFor();
  await page.screenshot({path:'artifacts/report-recovered-mobile.png',fullPage:true,animations:'disabled'});
  await page.goto(`${origin}/settings`);
  await page.getByRole('heading',{name:'Brand studio',exact:true}).waitFor();
  await page.getByLabel('Brand name',{exact:true}).fill('Unsaved browser draft');
  // Use the visible app navigation to exercise client-side blocking.
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Reports',exact:true}).click();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Margin Analysis',exact:true}).click();
  await page.getByRole('dialog',{name:'Unsaved changes',exact:true}).waitFor();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  assert.equal(await page.getByLabel('Brand name',{exact:true}).inputValue(),'Unsaved browser draft');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Margin Analysis',exact:true}).click();
  await page.getByRole('button',{name:'Discard and leave',exact:true}).click();
  await page.getByRole('heading',{name:'Margin Analysis',exact:true}).waitFor();

  await page.goto(`${origin}/settings`);
  await page.getByRole('heading',{name:'Brand studio',exact:true}).waitFor();
  await page.getByRole('button',{name:'Check email configuration',exact:true}).click();
  await page.getByText('API configuration is present. Verify the sender before sending.',{exact:true}).waitFor();
  await pickOption(page.getByLabel('Email template',{exact:true}),'letterhead');
  await page.getByRole('button',{name:'Preview saved email identity',exact:true}).click();
  await page.frameLocator('iframe[title="Email template preview"]').getByRole('heading',{name:'Company email preview'}).waitFor();
  await pickOption(page.getByLabel('Global font',{exact:true}),'serif');
  await pickOption(page.getByLabel('Text size',{exact:true}),'large');
  await pickOption(page.getByLabel('Logo shape',{exact:true}),'circle');
  await page.getByRole('button',{name:'Save brand settings',exact:true}).click();
  await page.getByText('Company settings are up to date',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--brand-font')),'Georgia, serif');
  assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--brand-logo-radius')),'50%');
  await page.screenshot({path:'artifacts/company-email-appearance-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Brand studio appearance controls fit mobile width');
  await page.screenshot({path:'artifacts/company-email-appearance-mobile.png',fullPage:true,animations:'disabled'});
  await pickOption(page.getByLabel('Global font',{exact:true}),'inter');
  await pickOption(page.getByLabel('Text size',{exact:true}),'default');
  await pickOption(page.getByLabel('Logo shape',{exact:true}),'rounded');
  await page.getByRole('button',{name:'Save brand settings',exact:true}).click();
  await page.getByText('Company settings are up to date',{exact:true}).waitFor();
  const platformContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  await platformContext.addInitScript(() => {
    if (window.top !== window) return;
    const user = { _id: 'platform-fixture', name: 'Platform Admin', role: 'superadmin', permissions: ['superadmin:all'], isActive: true, shop: null };
    localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('posUser', JSON.stringify(user)); sessionStorage.setItem('token', 'platform-fixture');
  });
  await platformContext.routeWebSocket('**/*', socket => socket.close());
  await platformContext.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin && route.request().resourceType() === 'document') return route.continue();
    const path = url.pathname.replace(/^\/api/, '');
    if (path === '/auth/profile') return route.fulfill({ json: { success: true, data: { user: { _id: 'platform-fixture', name: 'Platform Admin', role: 'superadmin', permissions: ['superadmin:all'], isActive: true, shop: null } } } });
    if (path === '/superadmin/stats') return route.fulfill({ json: { success: true, data: { totalShops: 0, approvedShops: 0, pendingShops: 0, totalUsers: 1, planBreakdown: {} } } });
    if (path === '/superadmin/shops') return route.fulfill({ json: { success: true, data: { shops: [] } } });
    return url.origin === origin ? route.continue() : route.abort();
  });
  const platformPage = await platformContext.newPage();
  platformPage.on('pageerror', error => pageErrors.push(error.message));
  await platformPage.goto(`${origin}/`);
  await platformPage.getByRole('heading', { name: 'Platform control center', exact: true }).waitFor();
  await platformPage.getByText('No shops found', { exact: true }).waitFor();
  await platformPage.screenshot({ path: 'artifacts/platform-desktop.png', fullPage: true, animations: 'disabled' });
  await platformPage.setViewportSize({ width: 390, height: 844 });
  assert.equal(await platformPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'Platform overview must fit mobile width');
  await platformPage.screenshot({ path: 'artifacts/platform-mobile.png', fullPage: true, animations: 'disabled' });
  await platformContext.close();
  assert.deepEqual(pageErrors, []);
  console.log('Browser smoke passed: assistant retry/results/connections/mobile, label quantity worksheet and result invalidation, POS desktop/mobile, offline guard, zero stock-count recovery, supplier payment, mobile supplier ledger, dialog keyboard focus, farmer seasons, and follow-up create/reschedule/complete, branding settings, role creation/assignment, platform desktop/mobile, live theme/dark-mode persistence, directory search/retry/mobile controls, and company logo upload/header persistence.');
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

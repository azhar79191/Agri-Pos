import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const origin = 'http://127.0.0.1:5179';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5179', '--strictPort'], { windowsHide: true, stdio: 'inherit' });
for (let i = 0; i < 100; i++) {
  try {
    const r = await fetch(origin);
    if (r.ok) break;
  } catch {}
  await new Promise(r => setTimeout(r, 200));
}
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
const user = { _id: 'a', name: 'Test', role: 'admin', permissions: [], shop: { _id: 'b', name: 'Test Agri Shop', isApproved: true, isActive: true, planStatus: 'active', taxRate: 0, currency: 'Rs.' } };
await context.addInitScript((u) => {
  localStorage.setItem('user', JSON.stringify(u));
  localStorage.setItem('posUser', JSON.stringify(u));
  sessionStorage.setItem('token', 'isolated-browser-fixture');
}, user);
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.origin === origin && route.request().resourceType() === 'document') return route.continue();
  const path = url.pathname.replace(/^\/api/, '');
  if (path === '/auth/profile') return route.fulfill({ json: { success: true, data: { user } } });
  if (path === '/settings') return route.fulfill({ json: { success: true, data: { settings: { shopName: 'Test Agri Shop', brandName: '', brandTagline: '', brandColor: '#047857', brandLogo: '', emailFooter: 'Thank you', actionEmailsEnabled: false } } } });
  if (path === '/settings/email-status') return route.fulfill({ json: { success: true, data: { providerConfigured: false, workerEnabled: false, jobs: [] } } });
  if (path === '/settings/email-check') return route.fulfill({ json: { success: true, data: { success: true, verified: false, provider: 'sendgrid-api', message: 'API configuration is present.' } } });
  return route.continue();
});
const page = await context.newPage();
page.on('console', msg => console.log('BROWSER_CONSOLE', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE_ERROR', err.message));
await page.goto(`${origin}/settings`);
await page.getByRole('button', { name: /Company Branding/ }).click();
await page.getByLabel('Brand name', { exact: true }).fill('Green Fields');
await page.getByLabel('Tagline', { exact: true }).fill('Your crop partner');
console.log('DIALOG_COUNT_BEFORE_CLICK', await page.getByRole('dialog').count());
console.log('DIALOG_TEXT', await page.locator('[role="dialog"]').allTextContents());
await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
console.log('AFTER_SAVE_TEXT', await page.getByText('Company settings are up to date', { exact: true }).count());
console.log('ROOT_THEME_AFTER_SAVE', await page.evaluate(() => document.documentElement.style.getPropertyValue('--pos-primary')));
await page.getByRole('button', { name: 'Rose company theme', exact: true }).click();
await page.getByLabel('Company appearance', { exact: true }).selectOption('dark');
await page.getByRole('button', { name: 'Save brand settings', exact: true }).click();
console.log('ROOT_THEME_AFTER_DARK', await page.evaluate(() => document.documentElement.style.getPropertyValue('--pos-primary')));
console.log('DARK_CLASS', await page.evaluate(() => document.documentElement.classList.contains('dark')));
await browser.close();
server.kill();

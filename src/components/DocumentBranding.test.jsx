// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Link } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import DocumentBranding from './DocumentBranding';
import { PLATFORM_BRAND } from '../constants/platformBrand';
const { state } = vi.hoisted(() => ({ state: { isAuthenticated: true, currentUser: { role: 'admin', shop: 'shop-a' }, settings: { brandName: 'Company A', brandLogo: 'https://example.test/company.png' } } }));
vi.mock('../context/AppContext', () => ({ useApp: () => ({ state }) }));
afterEach(() => { cleanup(); state.isAuthenticated = true; state.currentUser.role = 'admin'; });
function Example({path='/'}) { return <MemoryRouter initialEntries={[path]}><DocumentBranding /><Link to="/dashboard">Workspace</Link><Link to="/">Public site</Link><Link to="/demo">Demo</Link></MemoryRouter>; }
function expectPlatform() {
 expect(document.title).toBe(PLATFORM_BRAND.name);
 expect([...document.querySelectorAll('link[rel="icon"]')].map(link=>link.getAttribute('href'))).toEqual(['/favicon.svg','/favicon-32x32.png','/favicon-16x16.png']);
 expect(document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')).toBe('/apple-touch-icon.png');
}
it.each(['/', '/login', '/register', '/demo', '/login/'])('keeps platform identity on public route %s despite saved company settings', path => {
 render(<Example path={path} />); expectPlatform();
});
it('switches both title and all icons when moving between workspace and public pages', () => {
 render(<Example />); fireEvent.click(screen.getByRole('link',{name:'Workspace'}));
 expect(document.title).toBe('Company A');
 expect([...document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]')].every(link=>link.getAttribute('href')===state.settings.brandLogo)).toBe(true);
 expect(document.querySelector('link[rel="icon"]').getAttribute('type')).toBeNull();
 fireEvent.click(screen.getByRole('link',{name:'Public site'})); expectPlatform();
 fireEvent.click(screen.getByRole('link',{name:'Workspace'})); fireEvent.click(screen.getByRole('link',{name:'Demo'})); expectPlatform();
});
it('ignores stale company settings when signed out, including protected URLs', () => {
 state.isAuthenticated=false; render(<Example path="/dashboard" />); expectPlatform();
});
it('uses platform branding for platform administrators', () => {
 state.currentUser.role='superadmin'; render(<Example path="/dashboard" />); expectPlatform();
});

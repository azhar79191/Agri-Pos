import { MemoryRouter } from 'react-router-dom';
import DocumentBranding from '../components/DocumentBranding';
import { PLATFORM_BRAND } from '../constants/platformBrand';
// @vitest-environment jsdom
import React from 'react';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../api/authApi', () => ({ getProfile: vi.fn(() => Promise.reject(new Error('offline'))) }));
vi.mock('../hooks/useSocket', () => ({ disconnectSocket: vi.fn() }));
import { AppProvider, useApp } from './AppContext';
let actions,settings;
function Probe() {
  const app = useApp(); actions = app.actions;settings=app.state.settings;
  return <span data-testid="identity">{app.state.settings.brandName}|{app.state.themeColor}|{String(app.state.darkMode)}</span>;
}
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); });
it('isolates company appearance and clears branding on logout', async () => {
  render(<MemoryRouter initialEntries={['/dashboard']}><AppProvider><DocumentBranding /><Probe /></AppProvider></MemoryRouter>);
  act(() => actions.login('', '', { name: 'A', shop: { _id: 'a', brandName: 'Company A', brandColor: '#7c3aed', theme: 'dark' } }));
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe('Company A|#7c3aed|true'));
  act(() => actions.login('', '', { name: 'B', shop: { _id: 'b', brandName: 'Company B', theme: 'light' } }));
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe('Company B|#047857|false'));
  act(() => actions.applyCompanySettings({ brandName: 'Stale A', brandColor: '#ff0000' }, 'a'));
  expect(document.title).toBe('Company B');
  act(() => actions.applyCompanySettings({ brandName: 'Updated B', brandColor: '#0ea5e9', theme: 'dark' }, 'b'));
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe('Updated B|#0ea5e9|true'));
  act(() => actions.logout());
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe('|#047857|false'));
  expect(document.title).toBe(PLATFORM_BRAND.name);
});

it('restores templates at login, persists edits in the company record, and resets on company change',async()=>{
 render(<MemoryRouter><AppProvider><Probe/></AppProvider></MemoryRouter>);
 act(()=>actions.login('','',{_id:'user-a',name:'A',shop:{_id:'a',receiptTemplate:'letterhead',emailTemplate:'minimal',invoiceTerms:'Company A terms',documentTimezone:'Europe/London'}}));
 await waitFor(()=>expect(settings.receiptTemplate).toBe('letterhead'));
 expect(settings.invoiceTerms).toBe('Company A terms');
 act(()=>actions.applyCompanySettings({receiptTemplate:'minimal',emailTemplate:'letterhead',invoiceTerms:'Updated terms',shopName:'A'},'a'));
 await waitFor(()=>expect(JSON.parse(localStorage.getItem('user')).shop.receiptTemplate).toBe('minimal'));
 expect(JSON.parse(localStorage.getItem('user')).shop.invoiceTerms).toBe('Updated terms');
 act(()=>actions.login('','',{_id:'user-b',name:'B',shop:{_id:'b',name:'B'}}));
 await waitFor(()=>expect(settings.receiptTemplate).toBe('standard'));
 expect(settings.invoiceTerms).toBe('');expect(settings.documentTimezone).toBe('Asia/Karachi');
});

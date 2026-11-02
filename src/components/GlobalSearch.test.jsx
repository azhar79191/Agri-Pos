// @vitest-environment jsdom
import React from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
const access=vi.hoisted(()=>({state:{currentUser:{_id:'staff',role:'cashier'}},actions:{hasPermission:key=>['products:view'].includes(key)}}));
vi.mock('../context/AppContext',()=>({useApp:()=>access}));
import GlobalSearch from './GlobalSearch';
afterEach(cleanup);
beforeEach(()=>{localStorage.clear();localStorage.setItem('user',JSON.stringify({_id:'staff',shop:'shop'}));});
it('filters pages, recent history and creation shortcuts by permission',async()=>{
 localStorage.setItem('agrinest_recent_searches:shop:staff',JSON.stringify([{id:'settings',path:'/settings',label:'App Settings'}]));
 render(<MemoryRouter><GlobalSearch/></MemoryRouter>);
 fireEvent.keyDown(window,{key:'k',ctrlKey:true});
 await screen.findByRole('dialog',{name:'Search workspace'});
 expect(screen.queryByText('Add Product')).toBeNull();expect(screen.queryByText('App Settings')).toBeNull();
 const input=screen.getByPlaceholderText('Search pages, features, settings...');
 fireEvent.change(input,{target:{value:'reports'}});expect(screen.queryByText('Sales Report')).toBeNull();
 fireEvent.change(input,{target:{value:'products'}});expect(screen.getByText('Products')).toBeTruthy();
});

it('opens one search dialog when both responsive headers are mounted', async () => {
 const original = window.matchMedia;
 window.matchMedia = vi.fn(() => ({ matches: true }));
 try {
  render(<MemoryRouter><GlobalSearch /><GlobalSearch mobile /></MemoryRouter>);
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  await screen.findByRole('dialog', { name: 'Search workspace' });
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
 } finally { window.matchMedia = original; }
});
it('navigates even when recent-history storage is blocked', async () => {
 const { useLocation } = await import('react-router-dom');
 const CurrentPath = () => <output>{useLocation().pathname}</output>;
 const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
 try {
  render(<MemoryRouter><GlobalSearch /><CurrentPath /></MemoryRouter>);
  fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
  fireEvent.change(await screen.findByPlaceholderText('Search pages, features, settings...'), { target: { value: 'products' } });
  fireEvent.click(screen.getByText('Products'));
  expect(screen.getByText('/products')).toBeTruthy();
 } finally { storage.mockRestore(); }
});

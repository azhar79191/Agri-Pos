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

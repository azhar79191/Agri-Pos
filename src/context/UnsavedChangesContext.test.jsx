// @vitest-environment jsdom
import React,{useState} from 'react';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {createMemoryRouter,RouterProvider,Link} from 'react-router-dom';
import {afterEach,expect,it} from 'vitest';
import {UnsavedChangesProvider,usePageUnsaved} from './UnsavedChangesContext';
import FeedbackHost from '../components/FeedbackHost';
afterEach(cleanup);
it('protects a full-page form, preserves it on cancel and discards explicitly',async()=>{
 function Form(){const [name,setName]=useState('');usePageUnsaved({dirty:!!name,onDiscard:()=>setName('')});return <><input aria-label="Draft" value={name} onChange={event=>setName(event.target.value)}/><Link to="/next">Leave</Link></>;}
 const router=createMemoryRouter([{path:'*',element:<UnsavedChangesProvider><Form/><FeedbackHost/></UnsavedChangesProvider>}],{initialEntries:['/edit']});
 render(<RouterProvider router={router}/>);
 fireEvent.change(screen.getByLabelText('Draft'),{target:{value:'Unsaved record'}});fireEvent.click(screen.getByText('Leave'));
 await screen.findByRole('dialog',{name:'Unsaved changes'});
 fireEvent.click(screen.getByRole('button',{name:'Cancel',exact:true}));
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(router.state.location.pathname).toBe('/edit');
 expect(screen.getByLabelText('Draft').value).toBe('Unsaved record');
 fireEvent.click(screen.getByText('Leave'));await screen.findByRole('dialog',{name:'Unsaved changes'});
 fireEvent.click(screen.getByRole('button',{name:'Discard and leave'}));await waitFor(()=>expect(router.state.location.pathname).toBe('/next'));
 expect(screen.getByLabelText('Draft').value).toBe('');
});

// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import Invoice from './Invoice';
import Studio from '../pages/settings/DocumentTemplateStudio';
import { TEMPLATE_SAMPLE } from '../pages/settings/templateSample';
import API from '../api/axios';
vi.mock('../api/axios',()=>({default:{post:vi.fn()}}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
it.each(['standard','letterhead','minimal'])('renders complete %s invoice with exact zero total and tax amount',template=>{
 const {container}=render(<Invoice invoice={{...TEMPLATE_SAMPLE,total:0,grandTotal:100,taxRate:0,taxAmount:5}} settings={{brandName:'Company A',receiptTemplate:template,currency:'Rs.',receiptFooter:'Custom footer'}} preview/>);
 expect(container.querySelector('article').dataset.receiptTemplate).toBe(template);
 expect(container.querySelector('.document-grand-total').textContent).toContain('Rs. 0.00');
 expect(screen.getByText('Company A',{selector:'h1'})).toBeTruthy();
 expect(screen.getByText('Custom footer')).toBeTruthy();
 expect(screen.queryByText('All sales are final unless defective')).toBeNull();
 expect(container.querySelector('.document-items').textContent).toContain('Crop nutrition blend');
});
it('selects both designs and previews current unsaved company identity without sending email',async()=>{
 API.post.mockResolvedValue({data:{data:{html:'<html><body><h1>Draft company</h1></body></html>'}}});
 const change=vi.fn();render(<Studio form={{brandName:'Draft company',receiptTemplate:'standard',emailTemplate:'standard'}} onChange={change} logo="" canEdit/>);
 fireEvent.click(screen.getByRole('button',{name:/Use Letterhead design/}));
 expect(change).toHaveBeenCalledWith('receiptTemplate','letterhead');
 expect(change).toHaveBeenCalledWith('emailTemplate','letterhead');
 fireEvent.click(screen.getByRole('button',{name:'Email',exact:true}));
 await waitFor(()=>expect(screen.getByTitle('Complete email preview').getAttribute('srcdoc')).toContain('Draft company'));
 expect(API.post).toHaveBeenCalledTimes(1);
 expect(API.post).toHaveBeenCalledWith('/settings/email-preview',expect.objectContaining({brandName:'Draft company'}));
});

// @vitest-environment jsdom
import {renderHook,act,waitFor,cleanup} from '@testing-library/react';
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
const api=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('../api/axios',()=>({default:api}));
vi.mock('./useOnlineStatus',()=>({useOnlineStatus:()=>true}));
import useOfflineQueue from './useOfflineQueue';
import {financialCommand} from '../api/financialCommand';
beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.resetAllMocks();localStorage.setItem('user',JSON.stringify({_id:'staff',shop:'shop'}));});
afterEach(cleanup);
it('does not advertise active saves for recovery or replay them automatically',async()=>{
 let reject;api.request.mockImplementationOnce(()=>new Promise((resolve,rejectRequest)=>{reject=rejectRequest;}));
 const view=renderHook(()=>useOfflineQueue());let pending;
 act(()=>{pending=financialCommand('post','/customers/farmer/deposit',{amount:10}).catch(()=>{});});
 await waitFor(()=>expect(api.request).toHaveBeenCalledOnce());expect(view.result.current.pendingCount).toBe(0);
 await act(async()=>{reject(new Error('Connection lost'));await pending;});
 await waitFor(()=>expect(view.result.current.pendingCount).toBe(1));
 expect(api.request).toHaveBeenCalledOnce();
 sessionStorage.clear();view.unmount();
 api.request.mockResolvedValueOnce({data:{success:true}});
 const recovered=renderHook(()=>useOfflineQueue());expect(recovered.result.current.pendingCount).toBe(1);
 let summary;await act(async()=>{summary=await recovered.result.current.retryAll();});
 expect(summary.confirmed).toBe(1);expect(summary.failed).toEqual([]);expect(recovered.result.current.pendingCount).toBe(0);
 expect(api.request.mock.calls[0][0].data.clientPaymentId).toBe(api.request.mock.calls[1][0].data.clientPaymentId);
});

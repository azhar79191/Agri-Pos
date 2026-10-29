// @vitest-environment jsdom
import {beforeEach,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('../api/axios',()=>({default:mocks}));
import {financialCommand} from '../api/financialCommand';
import {readRecoveryCommands,isRecoverableCommand} from './recoveryCommands';

beforeEach(()=>{localStorage.clear();sessionStorage.clear();vi.resetAllMocks();localStorage.setItem('user',JSON.stringify({_id:'cashier-a',shop:'shop-a'}));});
it('recovers after a browser session ends with the same operation ID and payload',async()=>{
 mocks.request.mockRejectedValueOnce(new Error('Connection lost')).mockResolvedValueOnce({data:{success:true}});
 await expect(financialCommand('post','/suppliers/supplier-a/payment',{amount:70},{idField:'clientOperationId',label:'Supplier payment'})).rejects.toThrow();
 const original=mocks.request.mock.calls[0][0].data.clientOperationId;
 sessionStorage.clear();const item=readRecoveryCommands()[0];expect(item.replayable).toBe(true);
 await financialCommand(item.method,item.path,JSON.parse(item.signature),{idField:item.idField,label:item.label});
 expect(mocks.request.mock.calls[1][0].data).toEqual({amount:70,clientOperationId:original});
 expect(readRecoveryCommands()).toHaveLength(0);
});
it('partitions recovery records and refuses legacy or unrecognized commands',async()=>{
 mocks.request.mockRejectedValue(new Error('Connection lost'));
 await expect(financialCommand('post','/customers/farmer-a/deposit',{amount:10})).rejects.toThrow();
 localStorage.setItem('user',JSON.stringify({_id:'cashier-b',shop:'shop-b'}));expect(readRecoveryCommands()).toHaveLength(0);
 expect(isRecoverableCommand({id:'legacy',method:'post',path:'/superadmin/shops',idField:'clientOperationId',signature:'{}'})).toBe(false);
 expect(isRecoverableCommand({id:'legacy',method:'post',path:'/stock/adjust',idField:'clientOperationId',signature:'null'})).toBe(false);
});
it('does not dispatch an old request using a newly switched account',async()=>{
 mocks.request.mockResolvedValue({data:{success:true}});
 const pending=financialCommand('post','/customers/farmer-a/deposit',{amount:10});
 localStorage.setItem('user',JSON.stringify({_id:'other',shop:'other-shop'}));
 await expect(pending).rejects.toThrow('Account changed');expect(mocks.request).not.toHaveBeenCalled();
 expect(readRecoveryCommands()).toHaveLength(0);
 localStorage.setItem('user',JSON.stringify({_id:'cashier-a',shop:'shop-a'}));expect(readRecoveryCommands()).toHaveLength(1);
});

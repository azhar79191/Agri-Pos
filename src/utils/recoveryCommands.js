import { browserScope, scopedStorageKey } from './browserScope';

export const isRecoverableCommand = item => {
  try { const payload=JSON.parse(item?.signature); if(!payload||typeof payload!=='object'||Array.isArray(payload))return false; } catch{return false;}
  return !!item?.id && typeof item.signature === 'string' && (
  item.idField === 'clientPaymentId' && ((item.method === 'post' && /^\/(customers\/[^/]+\/(deposit|wallet\/deposit)|invoices\/[^/]+\/payment)$/.test(item.path)) || item.method === 'put' && /^\/customers\/[^/]+\/credit$/.test(item.path)) ||
  item.idField === 'clientOperationId' && (['post','put','patch','delete'].includes(item.method) && /^\/(farmer-workspace|dealer-records|customer-orders|dealer-network)(\/|$)/.test(item.path) || (['post','put'].includes(item.method) && /^\/products(?:\/[^/]+)?$/.test(item.path)) || item.method === 'post' && /^\/(stock\/adjust(?:\/bulk)?|suppliers\/[^/]+\/payment|loyalty\/[^/]+\/redeem)$/.test(item.path) || ['post','put','delete'].includes(item.method) && /^\/purchase-returns(?:\/[^/]+(?:\/status)?)?$/.test(item.path))
); };
export function readRecoveryCommands() {
  if (browserScope() === 'signed-out') return [];
  const suffix=scopedStorageKey(''), found=new Map();
  for(const storage of [sessionStorage,localStorage]) for(let index=0;index<storage.length;index++){
    const key=storage.key(index);if(!key.startsWith('financial-command:')||!key.endsWith(suffix))continue;
    try{const command=JSON.parse(storage.getItem(key));found.set(key,{...command,key,id:key,recoveryId:command.id,replayable:isRecoverableCommand(command),queuedAt:command.queuedAt||new Date().toISOString()});}catch{found.set(key,{key,id:key,label:'Recovery record needs manual review',replayable:false,lastError:'The saved request cannot be read. Review the relevant records before entering a replacement.'});}
  }
  return [...found.values()];
}
export function readLegacyQueue() {
  if(browserScope()==='signed-out')return [];

  try { const items=JSON.parse(localStorage.getItem('agrinest_offline_queue')||'[]'); return Array.isArray(items)?items.map((item,index)=>({id:`legacy:${index}`,legacyIndex:index,label:'Legacy operation requires manual review',queuedAt:item?.queuedAt,attempts:item?.attempts||0,replayable:false,lastError:'The original request cannot be verified. Check the relevant records before creating a replacement.'})):[]; } catch {return [];}
}
export function dismissLegacy(index) {
  const items=JSON.parse(localStorage.getItem('agrinest_offline_queue')||'[]');items.splice(index,1);localStorage.setItem('agrinest_offline_queue',JSON.stringify(items));window.dispatchEvent(new Event('pending-commands-updated'));
}

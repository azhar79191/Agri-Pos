import { useState, useEffect, useRef, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { financialCommand, commandIsRunning } from '../api/financialCommand';
import { readRecoveryCommands, readLegacyQueue, dismissLegacy } from '../utils/recoveryCommands';
import { browserScope } from '../utils/browserScope';

const snapshot = () => [...readRecoveryCommands().filter(item=>!commandIsRunning(item.key)), ...readLegacyQueue()];
/** Recover only durable commands whose existing identifiers are accepted by the server. */
export default function useOfflineQueue() {
  const isOnline=useOnlineStatus(), running=useRef(false);
  const [queue,setQueue]=useState(snapshot), [retrying,setRetrying]=useState(false), [lastSynced,setLastSynced]=useState(null);
  useEffect(()=>{const reload=()=>{if(!running.current)setQueue(snapshot());};for(const event of ['pending-commands-updated','storage','business-session-reset','user-updated'])window.addEventListener(event,reload);return()=>{for(const event of ['pending-commands-updated','storage','business-session-reset','user-updated'])window.removeEventListener(event,reload);};},[]);
  const retryAll=useCallback(async()=>{
    if(!isOnline||running.current)return;
    running.current=true;setRetrying(true);const scope=browserScope(), summary={confirmed:0,failed:[],paths:[]};
    try{for(const item of readRecoveryCommands()){
      if(browserScope()!==scope)break;
      if(!item.replayable||commandIsRunning(item.key))continue;
      try{await financialCommand(item.method,item.path,JSON.parse(item.signature),{idField:item.idField,label:item.label});summary.confirmed++;summary.paths.push(item.path);}
      catch(error){summary.failed.push(error.response?.data?.message||error.message);setQueue(snapshot().map(record=>record.key===item.key?{...record,lastError:error.response?.data?.message||error.message||'The original request is retained.'}:record));}
    }if(summary.confirmed>0&&browserScope()===scope&&!summary.failed.length&&!readRecoveryCommands().length)setLastSynced(new Date());
    if(summary.confirmed>0&&browserScope()===scope)window.dispatchEvent(new CustomEvent('business-data-recovered',{detail:{paths:summary.paths}}));
    return {...summary,cancelled:browserScope()!==scope};}
    finally{running.current=false;setRetrying(false);setQueue(current=>snapshot().map(item=>({...item,lastError:current.find(row=>row.id===item.id)?.lastError||item.lastError})));}
  },[isOnline]);
  const removeFromQueue=useCallback(id=>{const item=readLegacyQueue().find(row=>row.id===id);if(item)dismissLegacy(item.legacyIndex);},[]);
  const clearAll=useCallback(()=>{localStorage.removeItem('agrinest_offline_queue');window.dispatchEvent(new Event('pending-commands-updated'));},[]);
  return {isOnline,pendingCount:queue.length,queue,retrying,lastSynced,retryAll,removeFromQueue,clearAll};
}

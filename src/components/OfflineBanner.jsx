import React, { useState } from 'react';
import { WifiOff, RotateCcw, ChevronDown, X } from 'lucide-react';
import Button from './ui/Button';
import { LoadingIndicator } from './ui/LoadingState';
import useOfflineQueue from '../hooks/useOfflineQueue';
import { confirmAction, notifyUser, showNotice } from '../utils/feedback';

export default function OfflineBanner(){
  const {isOnline,pendingCount,queue,retrying,retryAll,removeFromQueue}=useOfflineQueue();
  const [expanded,setExpanded]=useState(false);
  if(isOnline&&!pendingCount)return null;
  const recoverable=queue.filter(item=>item.replayable).length;
  return <section className="recovery-banner" aria-label="Connection and recovery">
    <div className="flex items-start gap-3"><span className="recovery-banner__icon"><WifiOff size={18}/></span><div className="min-w-0 flex-1"><h2>{isOnline?'Requests awaiting confirmation':"You're offline"}</h2><p>{pendingCount?`${pendingCount} request${pendingCount===1?'':'s'} need review.`:'Your cart is saved. Reconnect to confirm a sale.'}</p></div>{!!pendingCount&&<button type="button" aria-label="Show pending requests" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><ChevronDown size={17}/></button>}</div>
    {isOnline&&recoverable>0&&<Button variant="secondary" size="sm" disabled={retrying} className="mt-3 w-full" onClick={async()=>{if(await confirmAction({title:'Recover original requests',message:`Confirm ${recoverable} original request${recoverable===1?'':'s'} using the saved recovery IDs? Their original details will be reused to prevent duplicate entries.`,confirmText:'Recover requests',variant:'primary'})){const result=await retryAll();if(result&&!result.cancelled){if(result.failed.length)await notifyUser('Some requests could not be confirmed. Review the relevant records before entering replacements.\n'+result.failed.join('\n'));else if(result.confirmed)await showNotice({title:'Recovery complete',message:`${result.confirmed} original request${result.confirmed===1?'':'s'} confirmed using the saved IDs.`});}}}}>{retrying?<LoadingIndicator/>:<RotateCcw size={15}/>} {retrying?'Confirming requests':'Recover original requests'}</Button>}
    {expanded&&<div className="recovery-banner__list">{queue.map(item=><div key={item.id} className="recovery-banner__item"><div><p className="font-medium">{item.label||'Pending request'}</p><p>{item.lastError||(item.replayable?'Saved with its original recovery ID.':'Manual review required.')}</p></div>{item.legacyIndex!=null&&<button type="button" aria-label="Dismiss legacy reminder" onClick={async()=>{if(await confirmAction({title:'Dismiss legacy reminder',message:'This removes only this reminder. First verify the relevant shop records; it does not cancel or reverse a transaction.',confirmText:'Dismiss reminder'}))removeFromQueue(item.id);}}><X size={15}/></button>}</div>)}</div>}
  </section>;
}

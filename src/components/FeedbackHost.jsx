import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function FeedbackHost(){
  const pending=useRef([]),[queue,setQueue]=useState([]);
  useEffect(()=>{
    const receive=event=>{event.preventDefault();pending.current.push(event.detail);setQueue([...pending.current]);};
    window.addEventListener('workspace-feedback',receive);
    return()=>{window.removeEventListener('workspace-feedback',receive);pending.current.forEach(item=>item.resolve(false));pending.current=[];};
  },[]);
  const current=queue[0];if(!current)return null;
  const settle=value=>{const item=pending.current.shift();item?.resolve(value);setQueue([...pending.current]);};
  const confirm=current.kind==='confirm';
  return <Modal isOpen onClose={()=>settle(false)} protectChanges={false} size="sm" title={current.title||(confirm?'Confirm action':'Notice')} icon={confirm?AlertTriangle:Info} iconColor={current.variant==='primary'?'brand':'amber'}
    footer={<div className="flex justify-end gap-3">{confirm&&<Button variant="secondary" onClick={()=>settle(false)}>Cancel</Button>}<Button variant={confirm?(current.variant||'danger'):'primary'} onClick={()=>settle(true)}>{confirm?(current.confirmText||'Confirm'):'Close'}</Button></div>}>
    <p className="text-sm leading-relaxed whitespace-pre-wrap">{current.message}</p>
  </Modal>;
}

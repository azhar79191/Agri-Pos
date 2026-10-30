import React, { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { confirmAction, showNotice } from '../utils/feedback';
import { useEffect } from 'react';

const Context=createContext(null);
export function UnsavedChangesProvider({children}){
  const guards=useRef(new Map()),prompting=useRef(false);
  const active=useCallback(()=>[...guards.current.values()].map(read=>read()).filter(guard=>guard.dirty||guard.busy),[]);
  const ask=useCallback(async()=>{
    const pending=active();if(!pending.length)return true;
    if(pending.some(guard=>guard.busy)){await showNotice({title:'Save in progress',message:'Wait for confirmation before leaving this page.'});return false;}
    const discard=await confirmAction({title:'Unsaved changes',message:'Leave this page and discard your unsaved edits?',confirmText:'Discard and leave'});
    if(discard)pending.forEach(guard=>guard.onDiscard?.());return discard;
  },[active]);
  const blocker=useBlocker(useCallback(()=>active().length>0,[active]));
  useEffect(()=>{
    if(blocker.state!=='blocked'||prompting.current)return;
    prompting.current=true;
    ask().then(discard=>{if(discard)blocker.proceed();else blocker.reset();}).finally(()=>{prompting.current=false;});
  },[blocker,ask]);
  useEffect(()=>{const warn=event=>{if(active().length){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[active]);
  const context=useMemo(()=>({register:(id,read)=>{guards.current.set(id,read);return()=>guards.current.delete(id);},requestTransition:async work=>{if(await ask())work();}}),[ask]);
  return <Context.Provider value={context}>{children}</Context.Provider>;
}
export function usePageUnsaved(options){
  const context=useContext(Context),id=useId(),latest=useRef(options);latest.current=options;
  useLayoutEffect(() => {
    if (!context) return undefined;
    return context.register(id, () => latest.current);
  }, [context, id]);
}
export function useSafeTransition(){const context=useContext(Context);return context?.requestTransition|| (async work=>work());}

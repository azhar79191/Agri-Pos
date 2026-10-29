import { useEffect, useRef } from 'react';
import { notifyUser } from '../utils/feedback';
/** Refresh views after an explicitly recovered command without discarding draft inputs. */
export default function useRecoveryRefresh(refresh){
  const latest=useRef(refresh);latest.current=refresh;
  useEffect(()=>{const update=()=>Promise.resolve().then(()=>latest.current?.()).catch(()=>notifyUser('The original request was recovered, but this page could not refresh. Retry loading the records.'));window.addEventListener('business-data-recovered',update);return()=>window.removeEventListener('business-data-recovered',update);},[]);
}

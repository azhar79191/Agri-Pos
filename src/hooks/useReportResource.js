import { useCallback, useEffect, useRef, useState } from 'react';

/** Ignore late responses and never present a failed query as empty or zero data. */
export default function useReportResource(request, params = {}, validate) {
  const key = JSON.stringify(params);
  const generation = useRef(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ key:null, data:null, loading:true, error:'' });
  useEffect(() => {
    const stamp = ++generation.current;
    setResult({ key, data:null, loading:true, error:'' });
    Promise.resolve().then(() => request(JSON.parse(key))).then(response => {
      const data = response && typeof response==='object' && 'data' in response ? response.data?.data : response;
      if (data == null || validate && !validate(data)) throw new Error('The report response was incomplete. Please retry.');
      if (stamp === generation.current) setResult({ key, data, loading:false, error:'' });
    }).catch(error => {
      if (stamp === generation.current) setResult({ key, data:null, loading:false, error:error.response?.data?.message || error.message || 'Report unavailable. Please try again.' });
    });
    return () => { generation.current += 1; };
  }, [request, key, revision, validate]);
  const retry = useCallback(() => setRevision(value => value + 1), []);
  useEffect(()=>{window.addEventListener('business-data-recovered',retry);return()=>window.removeEventListener('business-data-recovered',retry);},[retry]);
  return { ...(result.key === key ? result : { data:null, loading:true, error:'' }), retry };
}

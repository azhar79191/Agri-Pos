// Only remove the retired worker and caches owned by this application.
export async function retireLegacyPWA() {
  const tasks=[];
  if ('serviceWorker' in navigator) {
    tasks.push(Promise.resolve().then(()=>navigator.serviceWorker.getRegistrations()).then(registrations=>Promise.allSettled(
      registrations.filter(registration=>[registration.active,registration.waiting,registration.installing].some(worker=>{
        if(!worker)return false;
        const url=new URL(worker.scriptURL,window.location.origin);
        return url.origin===window.location.origin&&url.pathname==='/sw.js';
      })).map(registration=>registration.unregister())
    )));
  }
  if ('caches' in window) {
    tasks.push(Promise.resolve().then(()=>window.caches.keys()).then(keys=>Promise.allSettled(keys.filter(key=>key.startsWith('agrinest-')).map(key=>window.caches.delete(key)))));
  }
  try { localStorage.removeItem('agrinest_pwa_installed'); } catch { /* Browser storage may be unavailable. */ }
  await Promise.allSettled(tasks);
}

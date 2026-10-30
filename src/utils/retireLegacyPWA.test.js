// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest';
import {retireLegacyPWA} from './retireLegacyPWA';
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();localStorage.clear();});
it('retires only the app worker and caches while retaining other browser data',async()=>{
 const owned={active:{scriptURL:window.location.origin+'/sw.js'},unregister:vi.fn().mockResolvedValue(true)};
 const other={active:{scriptURL:window.location.origin+'/other/sw.js'},unregister:vi.fn()};
 vi.stubGlobal('navigator',{serviceWorker:{getRegistrations:vi.fn().mockResolvedValue([owned,other])}});
 const remove=vi.fn().mockResolvedValue(true);
 vi.stubGlobal('caches',{keys:vi.fn().mockResolvedValue(['agrinest-v1','agrinest-v2','unrelated-cache']),delete:remove});
 localStorage.setItem('agrinest_pwa_installed','true');localStorage.setItem('user','retain-session');
 await retireLegacyPWA();
 expect(owned.unregister).toHaveBeenCalledOnce();expect(other.unregister).not.toHaveBeenCalled();
 expect(remove.mock.calls.map(([key])=>key)).toEqual(['agrinest-v1','agrinest-v2']);
 expect(localStorage.getItem('agrinest_pwa_installed')).toBeNull();expect(localStorage.getItem('user')).toBe('retain-session');
});
it('does not block startup if browser cleanup APIs reject',async()=>{
 vi.stubGlobal('navigator',{serviceWorker:{getRegistrations:vi.fn().mockRejectedValue(new Error('Blocked'))}});
 vi.stubGlobal('caches',{keys:vi.fn().mockRejectedValue(new Error('Blocked'))});
 await expect(retireLegacyPWA()).resolves.toBeUndefined();
});

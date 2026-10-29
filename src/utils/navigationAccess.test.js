import {expect,it} from 'vitest';
import {canAccessPath} from './navigationAccess';
it('matches route access and restricts role management to owners',()=>{
 const allowed=new Set(['products:view','reports:view','users:view']);const has=key=>allowed.has(key);
 expect(canAccessPath('/reports/profit',has,{role:'cashier'})).toBe(true);
 expect(canAccessPath('/staff/roles',has,{role:'manager'})).toBe(false);
 expect(canAccessPath('/staff/roles',has,{role:'admin'})).toBe(true);
 expect(canAccessPath('/settings',has,{role:'cashier'})).toBe(false);
 expect(canAccessPath('https://example.test',has,{role:'admin'})).toBe(false);
});

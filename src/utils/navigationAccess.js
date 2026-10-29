import { getRoleName } from './roleUtils';
export const routePermission = pathname => ({'dealer-workspace':'customers:view',assistant:'assistant:use',dashboard:'dashboard:view',pos:'pos:view',products:'products:view',inventory:'products:view',purchases:'stock:view',stock:'stock:view',customers:'customers:view',invoices:'invoices:view',sales:'invoices:view',reports:'reports:view',staff:'users:view',users:'users:view',recommendations:'ai:use',settings:'settings:view',shops:'settings:view',status:'invoices:view'}[pathname.split('/')[1]]);
export function canAccessPath(pathname, hasPermission, user){
  if(!user||pathname==='/staff/roles'&&getRoleName(user)!=='admin')return false;
  const permission=routePermission(pathname);return !!permission&&hasPermission(permission);
}

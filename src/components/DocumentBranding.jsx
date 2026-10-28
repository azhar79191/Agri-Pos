import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PLATFORM_BRAND } from "../constants/platformBrand";
import { companyName, companyLogo } from "../utils/company";
import { getRoleName } from "../utils/roleUtils";

const publicRoutes = new Set(['/', '/login', '/register', '/demo']);
const platformIcons = [
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
];
function setIdentity(title, logo) {
  document.title = title;
  document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => link.remove());
  for (const attributes of logo ? [{ rel: 'icon', href: logo }, { rel: 'apple-touch-icon', href: logo }] : platformIcons) {
    const link = document.createElement('link');
    for (const [name, value] of Object.entries(attributes)) link.setAttribute(name, value);
    document.head.appendChild(link);
  }
}

// Saved company settings must never brand the public website or a signed-out tab.
export default function DocumentBranding() {
  const { pathname } = useLocation();
  const { state: { isAuthenticated, currentUser, settings } } = useApp();
  const useCompany = isAuthenticated && getRoleName(currentUser) !== 'superadmin' && !publicRoutes.has(pathname.replace(/\/$/, '') || '/');
  const title = useCompany ? companyName(settings) : PLATFORM_BRAND.name;
  const logo = useCompany ? companyLogo(settings) : '';
  useLayoutEffect(() => {
    setIdentity(title, logo);
    return () => setIdentity(PLATFORM_BRAND.name, '');
  }, [title, logo]);
  return null;
}

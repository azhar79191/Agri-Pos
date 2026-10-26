// Public build-time defaults for pages shown before a shop is authenticated.
export const PLATFORM_BRAND = {
  name: import.meta.env.VITE_BRAND_NAME || 'AgriNest POS',
  tagline: import.meta.env.VITE_BRAND_TAGLINE || 'Agricultural dealer workspace',
};

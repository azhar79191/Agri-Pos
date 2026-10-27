// One display identity for every company-owned screen and document.
export const companyName = (settings = {}) => settings.brandName?.trim() || settings.shopName?.trim() || 'Your company';
export const companyLogo = (settings = {}) => settings.brandLogo || settings.shopLogo || '';
export const escapeCompanyHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

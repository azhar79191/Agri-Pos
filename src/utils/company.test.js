import { expect, it } from 'vitest';
import { companyName, escapeCompanyHtml } from './company';
it('uses configured branding and falls back to company details', () => {
  expect(companyName({ brandName: 'Acme', shopName: 'Registered Co' })).toBe('Acme');
  expect(companyName({ brandName: ' ', shopName: 'Registered Co' })).toBe('Registered Co');
  expect(companyName()).toBe('Your company');
  expect(escapeCompanyHtml('A&B <Shop>')).toBe('A&amp;B &lt;Shop&gt;');
});

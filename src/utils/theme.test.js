// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { applyTheme, themePalette } from './theme';
describe('shop theme palette', () => {
  it('updates the complete palette used by primary controls', () => {
    applyTheme('#7c3aed');
    expect(document.documentElement.style.getPropertyValue('--brand-500')).toBe('124 58 237');
    expect(document.documentElement.style.getPropertyValue('--pos-primary')).toBe('#7c3aed');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('262 83% 58%');
    expect(document.documentElement.style.getPropertyValue('--ring')).toBe('262 83% 58%');
    expect(document.documentElement.style.getPropertyValue('--pos-primary-hover')).not.toContain('#1d4ed8');
  });
  it('chooses readable foregrounds and rejects invalid colors', () => {
    expect(themePalette('#ffffff').foreground).toBe('#10221b');
    expect(themePalette('#000000').foreground).toBe('#ffffff');
    expect(themePalette('red;display:none').hex).toBe('#047857');
  });
});

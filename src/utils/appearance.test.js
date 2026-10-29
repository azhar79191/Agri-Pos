// @vitest-environment jsdom
import {afterEach,it,expect} from 'vitest';
import {applyAppearance,appearanceSettings} from './appearance';
afterEach(()=>applyAppearance({}));
it('applies company text, fonts, logo shape and panel corners globally',()=>{
 applyAppearance({fontFamily:'serif',textSize:'large',textColor:'#123456',darkTextColor:'#eeeeee',logoShape:'circle',cornerStyle:'soft'});
 const style=document.documentElement.style;
 expect(style.getPropertyValue('--brand-font')).toBe('Georgia, serif');expect(style.getPropertyValue('--brand-text-light')).toBe('#123456');expect(style.getPropertyValue('--brand-logo-radius')).toBe('50%');expect(style.getPropertyValue('--brand-radius')).toBe('18px');expect(style.fontSize).toBe('17.92px');
 applyAppearance({});expect(style.getPropertyValue('--brand-font')).toContain('Inter');expect(style.fontSize).toBe('16px');
});
it('fills missing values and rejects unsafe CSS strings',()=>{
 expect(appearanceSettings({}).logoShape).toBe('rounded');applyAppearance({fontFamily:'url(unsafe)',textColor:'url(unsafe)',logoShape:'url(unsafe)'});expect(document.documentElement.style.getPropertyValue('--brand-font')).not.toContain('unsafe');expect(document.documentElement.style.getPropertyValue('--brand-text-light')).toBe('#172033');
});

export const APPEARANCE_DEFAULTS={fontFamily:'inter',textSize:'default',textColor:'#172033',darkTextColor:'#edf0f7',logoShape:'rounded',cornerStyle:'rounded'};
export const COMPANY_FONTS={inter:'Inter, system-ui, sans-serif',system:'system-ui, sans-serif',serif:'Georgia, serif'};
export function appearanceSettings(shop={}){return Object.fromEntries(Object.entries(APPEARANCE_DEFAULTS).map(([key,value])=>[key,shop[key]||value]));}
export function applyAppearance(settings={},root=document.documentElement){
  const s=appearanceSettings(settings),scale={small:.95,default:1,large:1.12}[s.textSize]||1;
  root.style.setProperty('--brand-font',COMPANY_FONTS[s.fontFamily]||COMPANY_FONTS.inter);
  root.style.setProperty('--brand-text-scale',String(scale));
  root.style.fontSize=`${16*scale}px`;
  root.style.setProperty('--brand-text-light',/^#[0-9a-f]{6}$/i.test(s.textColor)?s.textColor:APPEARANCE_DEFAULTS.textColor);
  root.style.setProperty('--brand-text-dark',/^#[0-9a-f]{6}$/i.test(s.darkTextColor)?s.darkTextColor:APPEARANCE_DEFAULTS.darkTextColor);
  root.style.setProperty('--brand-logo-radius',{rounded:'10px',square:'0px',circle:'50%'}[s.logoShape]||'10px');
  root.style.setProperty('--brand-radius',{square:'4px',rounded:'12px',soft:'18px'}[s.cornerStyle]||'12px');
}

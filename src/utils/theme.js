const valid = color => /^#[0-9a-f]{6}$/i.test(color || '');
export function themePalette(color) {
  const hex = valid(color) ? color : '#047857';
  const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
  const mix = (target, ratio) => rgb.map(value => Math.round(value + (target - value) * ratio));
  const shades = { 50: mix(255, .95), 100: mix(255, .89), 200: mix(255, .75), 300: mix(255, .55), 400: mix(255, .25), 500: rgb, 600: mix(0, .15), 700: mix(0, .3), 800: mix(0, .45), 900: mix(0, .6), 950: mix(0, .75) };
  const luminance = rgb.map(value => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  return { hex, rgb, shades, foreground: luminance > .179 ? '#10221b' : '#ffffff' };
}
export function applyTheme(color, root = document.documentElement) {
  const palette = themePalette(color);
  root.style.setProperty('--pos-primary', palette.hex);
  root.style.setProperty('--pos-primary-hover', `rgb(${palette.shades[600].join(' ')})`);
  root.style.setProperty('--pos-primary-foreground', palette.foreground);
  root.style.setProperty('--pos-primary-foreground-rgb', palette.foreground === '#ffffff' ? '255 255 255' : '16 34 27');
  root.style.setProperty('--pos-primary-rgb', palette.rgb.join(' '));
  root.style.setProperty('--pos-accent', `rgb(${palette.shades[400].join(' ')})`);
  for (const [shade, values] of Object.entries(palette.shades)) root.style.setProperty(`--brand-${shade}`, values.join(' '));
  return palette;
}

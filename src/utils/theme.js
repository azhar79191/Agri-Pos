const valid = color => /^#[0-9a-f]{6}$/i.test(color || '');
const hsl = rgb => {
  const [red, green, blue] = rgb.map(value => value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
};

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
  const primaryHsl = hsl(palette.rgb);
  root.style.setProperty('--pos-primary', palette.hex);
  root.style.setProperty('--pos-primary-hover', `rgb(${palette.shades[600].join(' ')})`);
  root.style.setProperty('--pos-primary-foreground', palette.foreground);
  root.style.setProperty('--pos-primary-foreground-rgb', palette.foreground === '#ffffff' ? '255 255 255' : '16 34 27');
  root.style.setProperty('--pos-primary-rgb', palette.rgb.join(' '));
  root.style.setProperty('--pos-accent', `rgb(${palette.shades[400].join(' ')})`);
  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--primary-foreground', palette.foreground === '#ffffff' ? '0 0% 100%' : '222 47% 11%');
  root.style.setProperty('--ring', primaryHsl);
  for (const [shade, values] of Object.entries(palette.shades)) root.style.setProperty(`--brand-${shade}`, values.join(' '));
  return palette;
}

export function applySecondaryTheme(color, root = document.documentElement) {
  const palette = themePalette(valid(color) ? color : '#eef2f7');
  root.style.setProperty('--pos-secondary', palette.hex);
  root.style.setProperty('--pos-secondary-foreground', palette.foreground);
  return palette;
}

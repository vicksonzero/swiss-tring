import { LINE_COLOR_LIGHTNESS, LINE_COLOR_SATURATION } from './constants';

export function djb2(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // tslint:disable-next-line: no-bitwise
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

export function hashStringToNumber(str: string) {
  const hash = djb2(str);
  const result = (Math.abs(hash)) / 17179869180;
  return result;
}
export function hashStringToColor(str: string) {
  const [r, g, b] = hslToRgb(hashStringToNumber(str), LINE_COLOR_SATURATION, LINE_COLOR_LIGHTNESS);
  return [
    '#',
    ('0' + r.toString(16)).substr(-2),
    ('0' + g.toString(16)).substr(-2),
    ('0' + b.toString(16)).substr(-2),
  ].join('');
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
function hslToRgb(h: number, s: number, l: number) {

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1 / 6) { return p + (q - p) * 6 * t; }
    if (t < 1 / 2) { return q; }
    if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
    return p;
  }
  let r;
  let g;
  let b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

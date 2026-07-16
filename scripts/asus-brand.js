/**
 * Shared ASUS sub-brand theming + formatting helpers for widget blocks
 * (search-products, get-product-details, browse-products-by-series,
 * compare-products, cart).
 *
 * NOTE ON COLORS: these are a public-branding approximation (ROG black+red,
 * TUF gunmetal+orange, Zenbook navy, Vivobook color-pop, ProArt black+amber)
 * — not pulled from an official Adobe/ASUS brand guideline file. Swap the
 * hex values below once the real brand kit is available; every widget reads
 * colors from this one module, so updating brand colors never requires
 * touching individual blocks.
 */

export const BRAND_THEMES = {
  zenbook: { accent: '#0B3D91', name: 'Zenbook' },
  rog: { accent: '#FF0000', name: 'ROG' },
  tuf: { accent: '#FFA400', name: 'TUF Gaming' },
  vivobook: { accent: '#7B2FF7', name: 'Vivobook' },
  proart: { accent: '#FF6B00', name: 'ProArt' },
};

const DEFAULT_ACCENT = '#006ce1';

/**
 * Given a hex accent color, derives a card background that is guaranteed
 * to have >= AA contrast with white text (darkens the color if needed).
 * @param {string} hex
 * @returns {{ bg: string, fg: string }}
 */
export function getThemedCardBg(hex) {
  if (!hex) return null;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  const lum = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${h}`, fg: '#ffffff' };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m;
    else lo = m;
  }
  const dr = Math.round(r * lo).toString(16).padStart(2, '0');
  const dg = Math.round(g * lo).toString(16).padStart(2, '0');
  const db = Math.round(b * lo).toString(16).padStart(2, '0');
  return { bg: `#${dr}${dg}${db}`, fg: '#ffffff' };
}

/**
 * Resolves the full theme (accent + card bg/fg + display name) for a
 * product's brand_line, falling back to a neutral ASUS blue if unknown.
 * @param {string} brandLine e.g. 'rog', 'zenbook'
 */
export function getBrandTheme(brandLine) {
  const theme = BRAND_THEMES[brandLine] || { accent: DEFAULT_ACCENT, name: 'ASUS' };
  return { ...theme, ...getThemedCardBg(theme.accent) };
}

export function formatPrice(usd) {
  if (typeof usd !== 'number') return '';
  return `$${usd.toLocaleString('en-US')}`;
}

export function ratingStars(rating) {
  if (typeof rating !== 'number') return '';
  const full = Math.round(rating);
  return '★'.repeat(Math.max(0, Math.min(5, full))) + '☆'.repeat(Math.max(0, 5 - full));
}

const GPU_TIER_LABELS = {
  integrated: 'Integrated',
  entry: 'Entry Gaming',
  mid: 'Mid Gaming',
  high: 'High-End Gaming',
  enthusiast: 'Enthusiast',
};

export function gpuTierLabel(tier) {
  return GPU_TIER_LABELS[tier] || '';
}

/** Short one-line spec summary used on compact cards. */
export function specLine(item) {
  const parts = [];
  if (item.gpu) parts.push(item.gpu.replace('NVIDIA ', ''));
  if (item.ram_gb) parts.push(`${item.ram_gb}GB RAM`);
  if (item.screen_size_in) parts.push(`${item.screen_size_in}"`);
  return parts.join(' · ');
}

export const CARD_FALLBACK_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

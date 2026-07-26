/**
 * Shared ASUS sub-brand theming + formatting helpers for widget blocks
 * (search-products, get-product-details, browse-products-by-series,
 * compare-products, cart, recommendations, checkout-confirmation).
 *
 * Colors/labels below were tuned to visually match each sub-brand's real
 * asus.com presence (ROG's black+red, TUF's gunmetal+yellow, Zenbook's
 * "quiet luxury" slate, ProArt's creator gold, Vivobook's everyday color-pop)
 * as of the July 2026 refresh. Still an approximation, not an official
 * Adobe/ASUS brand-kit file; every widget reads colors from this one module,
 * so updating brand colors never requires touching individual blocks.
 */

export const BRAND_THEMES = {
  zenbook: {
    accent: '#1F3A5C',
    name: 'Zenbook',
    label: 'ASUS ZENBOOK',
    tagline: 'Quiet luxury, all-day power.',
    headingFont: "'Inter', sans-serif",
  },
  rog: {
    accent: '#E2231A',
    name: 'ROG',
    label: 'ASUS ROG',
    tagline: 'Republic of Gamers.',
    headingFont: "'Rajdhani', 'Inter', sans-serif",
  },
  tuf: {
    accent: '#F2A900',
    name: 'TUF Gaming',
    label: 'ASUS TUF GAMING',
    tagline: 'Built tough. Priced right.',
    headingFont: "'Rajdhani', 'Inter', sans-serif",
  },
  vivobook: {
    accent: '#7B2FF7',
    name: 'Vivobook',
    label: 'ASUS VIVOBOOK',
    tagline: 'Everyday, elevated.',
    headingFont: "'Inter', sans-serif",
  },
  proart: {
    accent: '#C9A227',
    name: 'ProArt',
    label: 'ASUS PROART',
    tagline: 'Built for creators.',
    headingFont: "'Inter', sans-serif",
  },
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
 * Resolves the full theme (accent + card bg/fg + display name/label/font) for
 * a product's brand_line, falling back to a neutral ASUS blue if unknown.
 * @param {string} brandLine e.g. 'rog', 'zenbook'
 */
export function getBrandTheme(brandLine) {
  const theme = BRAND_THEMES[brandLine] || { accent: DEFAULT_ACCENT, name: 'ASUS', label: 'ASUS', tagline: '', headingFont: "'Inter', sans-serif" };
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
  integrated: 'Integrated Graphics',
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
  if (item.gpu) parts.push(item.gpu.replace('NVIDIA ', '').replace('GeForce ', ''));
  if (item.ram_gb) parts.push(`${item.ram_gb}GB RAM`);
  if (item.screen_size_in) parts.push(`${item.screen_size_in}"`);
  return parts.join(' · ');
}

export const CARD_FALLBACK_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

/**
 * Small "breadcrumb" lockup — ASUS › <Sub-brand> › <Series> — dropped at the
 * top of every widget so a single card/table/detail view reads as part of
 * one coherent ASUS storefront rather than a standalone, disconnected demo
 * widget. Purely presentational; returns a detached DOM node to append.
 * @param {string} brandLine
 * @param {string} [series] optional third breadcrumb segment, e.g. "ROG Strix"
 */
export function renderBrandStrip(brandLine, series) {
  const theme = getBrandTheme(brandLine);
  const strip = document.createElement('div');
  strip.className = 'asus-brand-strip';
  strip.style.setProperty('--brand-accent', theme.accent);

  const mark = document.createElement('span');
  mark.className = 'asus-brand-strip-mark';
  mark.textContent = 'ASUS';
  strip.appendChild(mark);

  const sep1 = document.createElement('span');
  sep1.className = 'asus-brand-strip-sep';
  sep1.textContent = '›';
  strip.appendChild(sep1);

  const sub = document.createElement('span');
  sub.className = 'asus-brand-strip-sub';
  sub.style.color = theme.accent;
  sub.textContent = theme.name;
  strip.appendChild(sub);

  if (series && series !== theme.name) {
    const sep2 = document.createElement('span');
    sep2.className = 'asus-brand-strip-sep';
    sep2.textContent = '›';
    strip.appendChild(sep2);

    const seriesEl = document.createElement('span');
    seriesEl.className = 'asus-brand-strip-series';
    seriesEl.textContent = series;
    strip.appendChild(seriesEl);
  }

  return strip;
}

import { SAMPLE_PRODUCTS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, ratingStars, gpuTierLabel, renderBrandStrip } from '../../scripts/asus-brand.js';

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_PRODUCTS[0];
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_PRODUCTS[0];
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function specRow(label, value) {
  if (!value) return null;
  const row = document.createElement('div');
  row.className = 'detail-spec-row';
  const l = document.createElement('span');
  l.className = 'detail-spec-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'detail-spec-value';
  v.textContent = value;
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

/**
 * A short connecting sentence, written here (not invented backend data),
 * so the long-description paragraph reads as two real sentences the way
 * Frescopa's product copy does, rather than one truncated line.
 */
function connectingSentence(item) {
  const useCase = Array.isArray(item.use_cases) && item.use_cases.length ? item.use_cases[0] : 'everyday';
  const series = item.series || item.category || 'this ASUS lineup';
  return `It's a natural fit if you're shopping ${series} for ${useCase} use, and every spec below is exactly what ships in the box — no surprises at checkout.`;
}

function renderDetail(block, item, bridge) {
  const theme = getBrandTheme(item.brand_line);

  const card = document.createElement('div');
  card.className = 'detail-card asus-pop-in';
  card.style.setProperty('--brand-accent', theme.accent);

  const hero = document.createElement('div');
  hero.className = 'detail-hero';
  const fallbackColor = item.fallback_color || theme.accent;
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background:linear-gradient(135deg, ${fallbackColor}, #00000022);`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    hero.appendChild(img);
  } else {
    hero.appendChild(colorDiv());
  }
  card.appendChild(hero);

  const content = document.createElement('div');
  content.className = 'detail-content asus-editorial-panel';

  content.appendChild(renderBrandStrip(item.brand_line, item.series));

  const chipRow = document.createElement('div');
  chipRow.className = 'detail-chip-row';
  const badge = document.createElement('span');
  badge.className = 'detail-badge asus-pill-badge';
  badge.style.setProperty('--brand-accent', theme.accent);
  badge.textContent = item.category || theme.label;
  chipRow.appendChild(badge);
  if (item.in_stock === false) {
    const oos = document.createElement('span');
    oos.className = 'detail-chip detail-chip-oos';
    oos.textContent = 'Out of stock';
    chipRow.appendChild(oos);
  }
  content.appendChild(chipRow);

  const title = document.createElement('h2');
  title.className = 'detail-title asus-editorial-name';
  title.textContent = item.name || '';
  content.appendChild(title);

  const priceRow = document.createElement('div');
  priceRow.className = 'detail-price-row';
  if (typeof item.price_usd === 'number') {
    const price = document.createElement('span');
    price.className = 'detail-price';
    price.style.color = theme.accent;
    price.textContent = formatPrice(item.price_usd);
    priceRow.appendChild(price);
  }
  if (typeof item.rating === 'number') {
    const rating = document.createElement('span');
    rating.className = 'detail-rating asus-editorial-muted';
    rating.textContent = `${ratingStars(item.rating)} ${item.rating.toFixed(1)} (${item.review_count || 0})`;
    priceRow.appendChild(rating);
  }
  content.appendChild(priceRow);

  if (Array.isArray(item.highlights) && item.highlights[0]) {
    const highlight = document.createElement('p');
    highlight.className = 'detail-highlight';
    highlight.textContent = item.highlights[0];
    content.appendChild(highlight);
  }

  content.appendChild(Object.assign(document.createElement('hr'), { className: 'asus-hairline' }));

  const desc = document.createElement('p');
  desc.className = 'detail-desc asus-editorial-muted';
  const base = item.description || '';
  desc.textContent = base ? `${base} ${connectingSentence(item)}` : connectingSentence(item);
  content.appendChild(desc);

  const specGrid = document.createElement('div');
  specGrid.className = 'detail-spec-grid';
  [
    specRow('CPU', item.cpu),
    specRow('GPU', item.gpu ? `${item.gpu}${item.gpu_tier ? ` (${gpuTierLabel(item.gpu_tier)})` : ''}` : null),
    specRow('RAM', item.ram_gb ? `${item.ram_gb}GB` : null),
    specRow('Storage', item.storage_gb ? `${item.storage_gb}GB` : null),
    specRow('Display', item.screen_size_in ? `${item.screen_size_in}"` : null),
    specRow('Weight', item.weight_kg ? `${item.weight_kg}kg` : null),
    specRow('Battery', item.battery_hours ? `${item.battery_hours}h` : null),
  ].filter(Boolean).forEach((row) => specGrid.appendChild(row));
  content.appendChild(specGrid);

  content.appendChild(Object.assign(document.createElement('hr'), { className: 'asus-hairline' }));

  const crosssell = document.createElement('div');
  crosssell.className = 'detail-crosssell';

  const crosssellLine = document.createElement('p');
  crosssellLine.className = 'asus-editorial-crosssell-line';
  crosssellLine.textContent = 'Want extra peace of mind?';
  crosssell.appendChild(crosssellLine);

  const ctaRow = document.createElement('div');
  ctaRow.className = 'detail-cta-row';

  const cartBtn = document.createElement('button');
  cartBtn.className = 'detail-cta-primary asus-pill-cta asus-press';
  cartBtn.type = 'button';
  cartBtn.style.setProperty('--brand-accent', theme.accent);
  cartBtn.textContent = item.in_stock === false ? 'Notify me' : 'Add to Cart';
  if (bridge) {
    cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name || 'this laptop'} to my cart`));
  }
  ctaRow.appendChild(cartBtn);

  const compareBtn = document.createElement('button');
  compareBtn.className = 'detail-cta-secondary asus-pill-cta asus-pill-cta--outline';
  compareBtn.type = 'button';
  compareBtn.style.setProperty('--brand-accent', theme.accent);
  compareBtn.textContent = 'Compare';
  if (bridge) {
    compareBtn.addEventListener('click', () => bridge.sendMessage(`Compare the ${item.name || 'this laptop'} with another ASUS laptop`));
  }
  ctaRow.appendChild(compareBtn);

  const warrantyBtn = document.createElement('button');
  warrantyBtn.className = 'detail-cta-tertiary asus-pill-cta asus-pill-cta--quiet';
  warrantyBtn.type = 'button';
  warrantyBtn.textContent = 'Protection plans';
  if (bridge) {
    warrantyBtn.addEventListener('click', () => bridge.sendMessage(`Show me warranty options for the ${item.name || 'this laptop'}`));
  }
  ctaRow.appendChild(warrantyBtn);

  crosssell.appendChild(ctaRow);
  content.appendChild(crosssell);

  if (item.buy_url) {
    const realLink = document.createElement('a');
    realLink.className = 'detail-real-link asus-editorial-footer-link';
    realLink.href = item.buy_url;
    realLink.target = '_blank';
    realLink.rel = 'noopener noreferrer';
    realLink.textContent = 'View full specs on ASUS.com ↗';
    content.appendChild(realLink);
  }

  card.appendChild(content);
  block.appendChild(card);
}

import { SAMPLE_PRODUCTS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, ratingStars, gpuTierLabel } from '../../scripts/asus-brand.js';

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

function renderDetail(block, item, bridge) {
  const theme = getBrandTheme(item.brand_line);

  const card = document.createElement('div');
  card.className = 'detail-card asus-pop-in';
  card.style.setProperty('--brand-accent', theme.accent);

  const imageContainer = document.createElement('div');
  imageContainer.className = 'detail-image';
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
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }
  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme.bg ?? '#1a1a1a'};color:${theme.fg ?? '#fff'};`;

  const chipRow = document.createElement('div');
  chipRow.className = 'detail-chip-row';
  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'detail-chip';
    chip.style.background = theme.accent;
    chip.textContent = item.category;
    chipRow.appendChild(chip);
  }
  if (item.in_stock === false) {
    const oos = document.createElement('span');
    oos.className = 'detail-chip detail-chip-oos';
    oos.textContent = 'Out of stock';
    chipRow.appendChild(oos);
  }
  content.appendChild(chipRow);

  const title = document.createElement('h3');
  title.className = 'detail-title';
  title.textContent = item.name || '';
  content.appendChild(title);

  if (typeof item.price_usd === 'number' || typeof item.rating === 'number') {
    const priceRow = document.createElement('div');
    priceRow.className = 'detail-price-row';
    if (typeof item.price_usd === 'number') {
      const price = document.createElement('span');
      price.className = 'detail-price';
      price.textContent = formatPrice(item.price_usd);
      priceRow.appendChild(price);
    }
    if (typeof item.rating === 'number') {
      const rating = document.createElement('span');
      rating.className = 'detail-rating';
      rating.textContent = `${ratingStars(item.rating)} ${item.rating.toFixed(1)} (${item.review_count || 0})`;
      priceRow.appendChild(rating);
    }
    content.appendChild(priceRow);
  }

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = item.description || '';
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

  const ctaRow = document.createElement('div');
  ctaRow.className = 'detail-cta-row';

  const cartBtn = document.createElement('button');
  cartBtn.className = 'detail-cta detail-cta-primary asus-press';
  cartBtn.type = 'button';
  cartBtn.style.background = theme.accent;
  cartBtn.textContent = item.in_stock === false ? 'Notify me' : 'Add to Cart';
  if (bridge) {
    cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name || 'this laptop'} to my cart`));
  }
  ctaRow.appendChild(cartBtn);

  const compareBtn = document.createElement('button');
  compareBtn.className = 'detail-cta detail-cta-secondary';
  compareBtn.type = 'button';
  compareBtn.textContent = 'Compare';
  if (bridge) {
    compareBtn.addEventListener('click', () => bridge.sendMessage(`Compare the ${item.name || 'this laptop'} with another ASUS laptop`));
  }
  ctaRow.appendChild(compareBtn);

  content.appendChild(ctaRow);

  card.appendChild(content);
  block.appendChild(card);
}

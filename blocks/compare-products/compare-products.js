import { SAMPLE_PRODUCTS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, gpuTierLabel } from '../../scripts/asus-brand.js';

const SPEC_FIELDS = [
  { key: 'price_usd', label: 'Price', format: (v) => formatPrice(v) },
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU', format: (v, item) => `${v}${item.gpu_tier ? ` (${gpuTierLabel(item.gpu_tier)})` : ''}` },
  { key: 'ram_gb', label: 'RAM', format: (v) => `${v}GB` },
  { key: 'storage_gb', label: 'Storage', format: (v) => `${v}GB` },
  { key: 'screen_size_in', label: 'Screen', format: (v) => `${v}"` },
  { key: 'weight_kg', label: 'Weight', format: (v) => `${v}kg` },
  { key: 'battery_hours', label: 'Battery', format: (v) => `${v}h` },
  { key: 'rating', label: 'Rating', format: (v) => `${v.toFixed(1)} / 5` },
];

function buildSamplePayload() {
  const products = SAMPLE_PRODUCTS.slice(1, 3); // ROG vs TUF for a meaningful preview
  const best_per_row = {
    price_usd: products.reduce((a, b) => (b.price_usd < a.price_usd ? b : a)).id,
    ram_gb: products.reduce((a, b) => (b.ram_gb > a.ram_gb ? b : a)).id,
    weight_kg: products.reduce((a, b) => (b.weight_kg < a.weight_kg ? b : a)).id,
    battery_hours: products.reduce((a, b) => (b.battery_hours > a.battery_hours ? b : a)).id,
    rating: products.reduce((a, b) => (b.rating > a.rating ? b : a)).id,
  };
  return { products, spec_fields: SPEC_FIELDS.map(({ key, label }) => ({ key, label })), best_per_row };
}

export default async function decorate(block, bridge) {
  let payload;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      payload = buildSamplePayload();
    } else {
      const _result = await bridge.toolResult;
      payload = _result?.structuredContent || _result || {};
    }
  } else {
    payload = buildSamplePayload();
  }

  block.textContent = '';
  renderCompare(block, payload, bridge);

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

function renderCompare(block, payload, bridge) {
  const products = payload?.products || [];
  const bestPerRow = payload?.best_per_row || {};

  if (products.length < 2) {
    const empty = document.createElement('p');
    empty.className = 'compare-products-empty';
    empty.textContent = 'Ask me to compare two or more ASUS laptops to see them side by side here.';
    block.appendChild(empty);
    return;
  }

  const table = document.createElement('div');
  table.className = 'compare-products-table';
  table.style.setProperty('--compare-cols', products.length);

  // Header row: spec label column + one header cell per product.
  const headerRow = document.createElement('div');
  headerRow.className = 'compare-products-row compare-products-header-row';
  headerRow.appendChild(document.createElement('div')).className = 'compare-products-cell compare-products-label-cell';

  products.forEach((item) => {
    const theme = getBrandTheme(item.brand_line);
    const cell = document.createElement('div');
    cell.className = 'compare-products-cell compare-products-header-cell';
    cell.style.setProperty('--brand-accent', theme.accent);

    const media = document.createElement('div');
    media.className = 'compare-products-media';
    const fallbackColor = item.fallback_color || theme.accent;
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`; img.remove(); };
      media.appendChild(img);
    } else {
      media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`;
    }
    cell.appendChild(media);

    const name = document.createElement('h4');
    name.className = 'compare-products-name';
    name.textContent = item.name || '';
    cell.appendChild(name);

    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'compare-products-cta';
    cartBtn.style.background = theme.accent;
    cartBtn.textContent = 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name} to my cart`));
    }
    cell.appendChild(cartBtn);

    headerRow.appendChild(cell);
  });
  table.appendChild(headerRow);

  SPEC_FIELDS.forEach(({ key, label, format }) => {
    const hasAnyValue = products.some((p) => p[key] !== undefined && p[key] !== null);
    if (!hasAnyValue) return;

    const row = document.createElement('div');
    row.className = 'compare-products-row';

    const labelCell = document.createElement('div');
    labelCell.className = 'compare-products-cell compare-products-label-cell';
    labelCell.textContent = label;
    row.appendChild(labelCell);

    products.forEach((item) => {
      const cell = document.createElement('div');
      cell.className = 'compare-products-cell';
      const raw = item[key];
      cell.textContent = raw === undefined || raw === null ? '—' : (format ? format(raw, item) : String(raw));
      if (bestPerRow[key] === item.id) {
        cell.classList.add('compare-products-winner');
      }
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  block.appendChild(table);
}

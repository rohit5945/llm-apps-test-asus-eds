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

const SAMPLE_CATALOG_OPTIONS = [
  { id: 'zenbook-duo-ux8407-2026', name: 'ASUS Zenbook DUO (UX8407)', brand_line: 'zenbook' },
  { id: 'proart-px13-hn7306', name: 'ASUS ProArt PX13 (HN7306)', brand_line: 'proart' },
  { id: 'vivobook-s14-m5406', name: 'ASUS Vivobook S14 (M5406)', brand_line: 'vivobook' },
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
  return {
    products,
    spec_fields: SPEC_FIELDS.map(({ key, label }) => ({ key, label })),
    best_per_row,
    catalog_options: SAMPLE_CATALOG_OPTIONS,
  };
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
  const catalogOptions = payload?.catalog_options || [];

  if (products.length < 2) {
    const empty = document.createElement('p');
    empty.className = 'compare-products-empty';
    empty.textContent = 'Ask me to compare two or more ASUS laptops to see them side by side here.';
    block.appendChild(empty);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'compare-products-wrapper';

  const heading = document.createElement('h3');
  heading.className = 'compare-products-heading asus-fade-in-up';
  heading.textContent = `Comparing ${products.length} ASUS laptops`;
  wrapper.appendChild(heading);

  const table = document.createElement('div');
  table.className = 'compare-products-table asus-editorial-panel asus-fade-in-up';
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
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      img.onerror = () => { media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`; img.remove(); };
      media.appendChild(img);
    } else {
      media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`;
    }
    cell.appendChild(media);

    const badge = document.createElement('span');
    badge.className = 'compare-products-badge asus-pill-badge';
    badge.style.setProperty('--brand-accent', theme.accent);
    badge.textContent = item.category || theme.label;
    cell.appendChild(badge);

    const name = document.createElement('h4');
    name.className = 'compare-products-name asus-editorial-name';
    name.textContent = item.name || '';
    cell.appendChild(name);

    if (typeof item.price_usd === 'number') {
      const price = document.createElement('span');
      price.className = 'compare-products-header-price';
      price.style.color = theme.accent;
      price.textContent = formatPrice(item.price_usd);
      cell.appendChild(price);
    }

    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'compare-products-cta asus-pill-cta asus-pill-cta--small asus-press';
    cartBtn.style.setProperty('--brand-accent', theme.accent);
    cartBtn.textContent = 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name} to my cart`));
    }
    cell.appendChild(cartBtn);

    if (item.buy_url) {
      const realLink = document.createElement('a');
      realLink.className = 'compare-products-real-link asus-editorial-footer-link';
      realLink.href = item.buy_url;
      realLink.target = '_blank';
      realLink.rel = 'noopener noreferrer';
      realLink.textContent = 'View on ASUS.com ↗';
      cell.appendChild(realLink);
    }

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

  wrapper.appendChild(table);

  // "Add another laptop to compare" picker — widgets can't call tools
  // directly, so this bundles every laptop NOT already in the comparison
  // (compare-products' structuredContent.catalog_options) and phrases the
  // selection as a full re-compare instruction via sendMessage().
  if (catalogOptions.length) {
    const picker = document.createElement('div');
    picker.className = 'compare-products-picker asus-editorial-tint asus-fade-in-up';

    const pickerLabel = document.createElement('label');
    pickerLabel.className = 'compare-products-picker-label';
    pickerLabel.setAttribute('for', 'compare-products-picker-select');
    pickerLabel.textContent = 'Add another laptop to this comparison';
    picker.appendChild(pickerLabel);

    const pickerRow = document.createElement('div');
    pickerRow.className = 'compare-products-picker-row';

    const select = document.createElement('select');
    select.id = 'compare-products-picker-select';
    select.className = 'compare-products-picker-select';
    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = 'Choose a laptop…';
    select.appendChild(placeholderOpt);
    catalogOptions.forEach((opt) => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.id;
      optionEl.textContent = opt.name;
      optionEl.dataset.name = opt.name;
      select.appendChild(optionEl);
    });
    pickerRow.appendChild(select);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'compare-products-picker-btn asus-pill-cta asus-pill-cta--outline asus-pill-cta--small';
    addBtn.textContent = 'Add to comparison';
    addBtn.disabled = true;
    select.addEventListener('change', () => { addBtn.disabled = !select.value; });
    if (bridge) {
      addBtn.addEventListener('click', () => {
        const chosen = select.options[select.selectedIndex];
        if (!chosen || !chosen.value) return;
        const currentNames = products.map((p) => p.name);
        const message = `Compare the ${[...currentNames, chosen.textContent].join(', ')}`;
        bridge.sendMessage(message);
      });
    }
    pickerRow.appendChild(addBtn);

    picker.appendChild(pickerRow);
    wrapper.appendChild(picker);
  }

  block.appendChild(wrapper);
}

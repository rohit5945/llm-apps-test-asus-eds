import { SAMPLE_PRODUCTS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, specLine, CARD_FALLBACK_COLORS } from '../../scripts/asus-brand.js';

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_PRODUCTS;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "browse_products_by_series"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_PRODUCTS;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'browse-products-by-series-wrapper';

  const track = document.createElement('div');
  track.className = 'browse-products-by-series-track';

  items.forEach((item, i) => {
    const theme = getBrandTheme(item.brand_line);
    const card = document.createElement('div');
    card.className = 'browse-products-by-series-card';
    card.style.setProperty('--brand-accent', theme.accent);

    const media = document.createElement('div');
    media.className = 'browse-products-by-series-media';
    const fallbackColor = item.fallback_color || CARD_FALLBACK_COLORS[i % CARD_FALLBACK_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background:linear-gradient(135deg, ${fallbackColor}, #00000022);`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      media.appendChild(img);
    } else {
      media.appendChild(colorDiv());
    }
    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'browse-products-by-series-info';
    info.style.cssText = `background:${theme.bg ?? '#1a1a1a'};color:${theme.fg ?? '#fff'};`;

    const badgeRow = document.createElement('div');
    badgeRow.className = 'browse-products-by-series-badge-row';
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'browse-products-by-series-badge';
      badge.style.background = theme.accent;
      badge.textContent = item.category;
      badgeRow.appendChild(badge);
    }
    if (typeof item.price_usd === 'number') {
      const price = document.createElement('span');
      price.className = 'browse-products-by-series-price';
      price.textContent = formatPrice(item.price_usd);
      badgeRow.appendChild(price);
    }
    info.appendChild(badgeRow);

    const title = document.createElement('h3');
    title.className = 'browse-products-by-series-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const spec = specLine(item);
    if (spec) {
      const specEl = document.createElement('p');
      specEl.className = 'browse-products-by-series-desc';
      specEl.textContent = spec;
      info.appendChild(specEl);
    }

    const btn = document.createElement('button');
    btn.className = 'browse-products-by-series-cta';
    btn.type = 'button';
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'browse-products-by-series-fade';

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `browse-products-by-series-arrow browse-products-by-series-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scroll = () => track.scrollBy({ left: dir === 'left' ? -236 : 236, behavior: 'smooth' });
    b.addEventListener('click', scroll);
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); } });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);
  block.appendChild(wrapper);
  requestAnimationFrame(updateArrows);
}

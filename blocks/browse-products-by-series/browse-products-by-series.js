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

  const heading = document.createElement('h3');
  heading.className = 'browse-products-by-series-heading asus-fade-in-up';
  heading.textContent = `${items.length} model${items.length === 1 ? '' : 's'} in this lineup`;
  wrapper.appendChild(heading);

  const track = document.createElement('div');
  track.className = 'browse-products-by-series-track';

  items.forEach((item, i) => {
    const theme = getBrandTheme(item.brand_line);
    const card = document.createElement('div');
    card.className = 'browse-products-by-series-card asus-fade-in-up asus-hover-lift';
    card.style.setProperty('--brand-accent', theme.accent);
    card.style.animationDelay = `${i * 60}ms`;

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
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      media.appendChild(img);
    } else {
      media.appendChild(colorDiv());
    }
    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'browse-products-by-series-info asus-editorial-panel';

    const badge = document.createElement('span');
    badge.className = 'browse-products-by-series-badge asus-pill-badge';
    badge.style.setProperty('--brand-accent', theme.accent);
    badge.textContent = item.category || theme.label;
    info.appendChild(badge);

    const title = document.createElement('h3');
    title.className = 'browse-products-by-series-title asus-editorial-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    const spec = specLine(item);
    if (spec) {
      const specEl = document.createElement('p');
      specEl.className = 'browse-products-by-series-desc asus-editorial-muted';
      specEl.textContent = spec;
      info.appendChild(specEl);
    }

    if (typeof item.price_usd === 'number') {
      const price = document.createElement('span');
      price.className = 'browse-products-by-series-price';
      price.style.color = theme.accent;
      price.textContent = formatPrice(item.price_usd);
      info.appendChild(price);
    }

    const ctaRow = document.createElement('div');
    ctaRow.className = 'browse-products-by-series-cta-row';

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'browse-products-by-series-cta-secondary asus-pill-cta asus-pill-cta--quiet asus-pill-cta--small';
    detailsBtn.type = 'button';
    detailsBtn.textContent = 'View Details';
    if (bridge) {
      detailsBtn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    ctaRow.appendChild(detailsBtn);

    const cartBtn = document.createElement('button');
    cartBtn.className = 'browse-products-by-series-cta-primary asus-pill-cta asus-pill-cta--small asus-press';
    cartBtn.type = 'button';
    cartBtn.style.setProperty('--brand-accent', theme.accent);
    cartBtn.textContent = 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name} to my cart`));
    }
    ctaRow.appendChild(cartBtn);

    info.appendChild(ctaRow);

    if (item.buy_url) {
      const realLink = document.createElement('a');
      realLink.className = 'browse-products-by-series-real-link asus-editorial-footer-link';
      realLink.href = item.buy_url;
      realLink.target = '_blank';
      realLink.rel = 'noopener noreferrer';
      realLink.textContent = 'View on ASUS.com ↗';
      info.appendChild(realLink);
    }

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
    const scroll = () => track.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
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

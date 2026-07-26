import { SAMPLE_PRODUCTS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, ratingStars, specLine, CARD_FALLBACK_COLORS } from '../../scripts/asus-brand.js';

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
      // structuredContent.products — derived from action name "search_products" (bare array outputSchema rule)
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
  const list = (items || []).slice(0, 10);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-wrapper';

  const heading = document.createElement('h3');
  heading.className = 'search-products-heading asus-fade-in-up';
  heading.textContent = list.length
    ? `${list.length} ASUS laptop${list.length === 1 ? '' : 's'} for you`
    : 'No ASUS laptops matched — try a different budget or use case';
  wrapper.appendChild(heading);

  if (list.length) {
    const guidance = document.createElement('p');
    guidance.className = 'search-products-guidance asus-fade-in-up';
    guidance.textContent = 'Tap Details to learn more, Compare to see them side by side, or Add to Cart when you\'re ready to buy.';
    wrapper.appendChild(guidance);
  }

  const track = document.createElement('div');
  track.className = 'search-products-track';

  list.forEach((item, i) => {
    const theme = getBrandTheme(item.brand_line);
    const card = document.createElement('div');
    card.className = 'search-products-card asus-fade-in-up asus-hover-lift';
    card.style.setProperty('--brand-accent', theme.accent);
    card.style.animationDelay = `${i * 60}ms`;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'search-products-image';

    const fallbackColor = item.fallback_color || CARD_FALLBACK_COLORS[i % CARD_FALLBACK_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.className = 'search-products-fallback-swatch';
      d.style.cssText = `width:100%;height:100%;background:linear-gradient(135deg, ${fallbackColor}, #00000022);`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }
    if (!item.in_stock) {
      const oos = document.createElement('span');
      oos.className = 'search-products-oos';
      oos.textContent = 'Out of stock';
      imageContainer.appendChild(oos);
    }
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme.bg ?? '#1a1a1a'};color:${theme.fg ?? '#fff'};`;

    const brandLabel = document.createElement('span');
    brandLabel.className = 'search-products-brand-label';
    brandLabel.style.color = theme.accent;
    brandLabel.style.fontFamily = theme.headingFont;
    brandLabel.textContent = theme.label;
    info.appendChild(brandLabel);

    if (item.category) {
      const badgeRow = document.createElement('div');
      badgeRow.className = 'search-products-badge-row';
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.style.background = theme.accent;
      badge.textContent = item.category;
      badgeRow.appendChild(badge);
      if (typeof item.price_usd === 'number') {
        const price = document.createElement('span');
        price.className = 'search-products-price';
        price.textContent = formatPrice(item.price_usd);
        badgeRow.appendChild(price);
      }
      info.appendChild(badgeRow);
    }

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    const spec = specLine(item);
    if (spec) {
      const specEl = document.createElement('p');
      specEl.className = 'search-products-spec';
      specEl.textContent = spec;
      info.appendChild(specEl);
    }

    if (typeof item.rating === 'number') {
      const rating = document.createElement('p');
      rating.className = 'search-products-rating';
      rating.textContent = `${ratingStars(item.rating)} ${item.rating.toFixed(1)}`;
      info.appendChild(rating);
    }

    const ctaRow = document.createElement('div');
    ctaRow.className = 'search-products-cta-row';

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'search-products-cta search-products-cta-secondary';
    detailsBtn.type = 'button';
    detailsBtn.textContent = 'Details';
    if (bridge) {
      detailsBtn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${item.name}`));
    }
    ctaRow.appendChild(detailsBtn);

    const cartBtn = document.createElement('button');
    cartBtn.className = 'search-products-cta search-products-cta-primary asus-press';
    cartBtn.type = 'button';
    cartBtn.style.background = theme.accent;
    cartBtn.textContent = item.in_stock === false ? 'Notify me' : 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name} to my cart`));
    }
    ctaRow.appendChild(cartBtn);

    info.appendChild(ctaRow);

    if (item.buy_url) {
      const realLink = document.createElement('a');
      realLink.className = 'search-products-real-link';
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
  fade.className = 'search-products-fade';

  const leftBtn = document.createElement('button');
  leftBtn.className = 'search-products-nav search-products-nav-left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'search-products-nav search-products-nav-right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const cardStep = 240 + 16;
  const scrollByCard = (dir) => track.scrollBy({ left: dir * cardStep, behavior: 'smooth' });
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((b, idx) => {
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollByCard(idx === 0 ? -1 : 1); }
    });
  });

  const updateNav = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftBtn.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
    const atEnd = track.scrollLeft >= maxScroll;
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateNav);

  wrapper.appendChild(track);
  wrapper.appendChild(fade);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);

  requestAnimationFrame(updateNav);
}

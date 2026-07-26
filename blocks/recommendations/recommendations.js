import { SAMPLE_RECOMMENDATIONS } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice, CARD_FALLBACK_COLORS } from '../../scripts/asus-brand.js';

export default async function decorate(block, bridge) {
  let payload;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      payload = SAMPLE_RECOMMENDATIONS;
    } else {
      const _result = await bridge.toolResult;
      payload = _result?.structuredContent || _result || {};
    }
  } else {
    payload = SAMPLE_RECOMMENDATIONS;
  }

  block.textContent = '';
  renderRecommendations(block, payload, bridge);

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

const HEADING_BY_BASIS = {
  product: 'You might also like',
  cart: 'Goes great with your cart',
  trending: 'Popular right now',
};

function renderRecommendations(block, payload, bridge) {
  const items = payload?.recommendations || [];

  const wrapper = document.createElement('div');
  wrapper.className = 'recommendations-wrapper';

  const heading = document.createElement('h3');
  heading.className = 'recommendations-heading asus-fade-in-up';
  heading.textContent = HEADING_BY_BASIS[payload?.based_on] || 'Recommended for you';
  wrapper.appendChild(heading);

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'recommendations-empty';
    empty.textContent = 'Ask me for a recommendation once you\'ve looked at a laptop or two!';
    wrapper.appendChild(empty);
    block.appendChild(wrapper);
    return;
  }

  const track = document.createElement('div');
  track.className = 'recommendations-track';

  items.forEach((item, i) => {
    const theme = getBrandTheme(item.brand_line);
    const card = document.createElement('div');
    card.className = 'recommendations-card asus-fade-in-up asus-hover-lift';
    card.style.setProperty('--brand-accent', theme.accent);
    card.style.animationDelay = `${i * 70}ms`;

    const media = document.createElement('div');
    media.className = 'recommendations-media';
    const fallbackColor = item.fallback_color || CARD_FALLBACK_COLORS[i % CARD_FALLBACK_COLORS.length];
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`; img.remove(); };
      media.appendChild(img);
    } else {
      media.style.background = `linear-gradient(135deg, ${fallbackColor}, #00000022)`;
    }
    if (item.is_accessory) {
      const tag = document.createElement('span');
      tag.className = 'recommendations-tag';
      tag.textContent = 'Accessory';
      media.appendChild(tag);
    }
    card.appendChild(media);

    const info = document.createElement('div');
    info.className = 'recommendations-info';
    info.style.cssText = `background:${theme.bg ?? '#1a1a1a'};color:${theme.fg ?? '#fff'};`;

    const name = document.createElement('h4');
    name.className = 'recommendations-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    if (item.reason) {
      const reason = document.createElement('p');
      reason.className = 'recommendations-reason';
      reason.textContent = item.reason;
      info.appendChild(reason);
    }

    if (typeof item.price_usd === 'number') {
      const price = document.createElement('span');
      price.className = 'recommendations-price';
      price.textContent = formatPrice(item.price_usd);
      info.appendChild(price);
    }

    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'recommendations-cta asus-press';
    cartBtn.style.background = theme.accent;
    cartBtn.textContent = 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => bridge.sendMessage(`Add the ${item.name} to my cart`));
    }
    info.appendChild(cartBtn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);
  block.appendChild(wrapper);
}

import { SAMPLE_WARRANTY_PLANS, SAMPLE_WARRANTY_PRODUCT } from '../../scripts/asus-sample-data.js';
import { getBrandTheme, formatPrice } from '../../scripts/asus-brand.js';

function buildSamplePayload() {
  return { product: SAMPLE_WARRANTY_PRODUCT, plans: SAMPLE_WARRANTY_PLANS };
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
  renderWarrantyOptions(block, payload, bridge);

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

function renderWarrantyOptions(block, payload, bridge) {
  const product = payload?.product || null;
  const plans = payload?.plans || [];
  const theme = getBrandTheme(product?.brand_line);

  const wrapper = document.createElement('div');
  wrapper.className = 'warranty-options-wrapper';
  wrapper.style.setProperty('--brand-accent', theme.accent);

  const header = document.createElement('div');
  header.className = 'warranty-options-header asus-fade-in-up';

  if (product) {
    const badge = document.createElement('span');
    badge.className = 'warranty-options-badge asus-pill-badge';
    badge.textContent = product.category || theme.label;
    header.appendChild(badge);

    const heading = document.createElement('h3');
    heading.className = 'warranty-options-heading';
    heading.innerHTML = `Protect your <span class="asus-editorial-name">${product.name || 'laptop'}</span>`;
    header.appendChild(heading);
  } else {
    const heading = document.createElement('h3');
    heading.className = 'warranty-options-heading';
    heading.textContent = 'ASUS Premium Care protection plans';
    header.appendChild(heading);

    const note = document.createElement('p');
    note.className = 'warranty-options-note asus-editorial-muted';
    note.textContent = 'Tell me which ASUS laptop you\'d like to protect and I\'ll show plans specific to it — for now, here are the general plans available for any laptop.';
    header.appendChild(note);
  }
  wrapper.appendChild(header);

  if (plans.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'warranty-options-empty';
    empty.textContent = 'No protection plans are available right now.';
    wrapper.appendChild(empty);
    block.appendChild(wrapper);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'warranty-options-grid';

  plans.forEach((plan, i) => {
    const card = document.createElement('div');
    card.className = 'warranty-options-card asus-editorial-panel asus-fade-in-up asus-hover-lift';
    card.style.animationDelay = `${i * 70}ms`;

    if (plan.includes_adp) {
      const featured = document.createElement('span');
      featured.className = 'warranty-options-featured asus-pill-badge';
      featured.textContent = 'Most Coverage';
      card.appendChild(featured);
    }

    const name = document.createElement('h4');
    name.className = 'warranty-options-name asus-editorial-name';
    name.textContent = plan.name || '';
    card.appendChild(name);

    if (typeof plan.price_usd === 'number') {
      const price = document.createElement('div');
      price.className = 'warranty-options-price';
      price.style.color = theme.accent;
      price.textContent = formatPrice(plan.price_usd);
      card.appendChild(price);
    }

    if (plan.description) {
      const desc = document.createElement('p');
      desc.className = 'warranty-options-desc asus-editorial-muted';
      desc.textContent = plan.description;
      card.appendChild(desc);
    }

    card.appendChild(Object.assign(document.createElement('hr'), { className: 'asus-hairline' }));

    if (Array.isArray(plan.covers) && plan.covers.length) {
      const checklist = document.createElement('ul');
      checklist.className = 'warranty-options-checklist';
      plan.covers.forEach((cover) => {
        const li = document.createElement('li');
        li.textContent = cover;
        checklist.appendChild(li);
      });
      card.appendChild(checklist);
    }

    const cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'warranty-options-cta asus-pill-cta asus-pill-cta--block asus-press';
    cartBtn.textContent = 'Add to Cart';
    if (bridge) {
      cartBtn.addEventListener('click', () => {
        const message = product
          ? `Add the ${plan.name} plan to my cart for the ${product.name}`
          : `Add the ${plan.name} plan to my cart`;
        bridge.sendMessage(message);
      });
    }
    card.appendChild(cartBtn);

    grid.appendChild(card);
  });

  wrapper.appendChild(grid);
  block.appendChild(wrapper);
}

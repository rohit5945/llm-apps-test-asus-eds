import { SAMPLE_CART } from '../../scripts/asus-sample-data.js';
import { formatPrice } from '../../scripts/asus-brand.js';

export default async function decorate(block, bridge) {
  let cart;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      cart = SAMPLE_CART;
    } else {
      const _result = await bridge.toolResult;
      cart = _result?.structuredContent || _result || { items: [] };
    }
  } else {
    cart = SAMPLE_CART;
  }

  block.textContent = '';
  renderCart(block, cart, bridge);

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

// The bridge only exposes sendMessage(text) — there's no direct tool-call
// API — so quantity/remove/checkout actions are phrased as an explicit
// instruction that includes the literal session_id, which the host model
// is expected to pass straight through to the manage-cart / checkout tools.
function cartInstruction(sessionId, action) {
  return `Using session_id ${sessionId}, ${action} in my ASUS cart.`;
}

function renderCart(block, cart, bridge) {
  const items = cart?.items || [];
  const sessionId = cart?.session_id || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'asus-cart-wrapper';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'asus-cart-empty asus-editorial-tint';
    empty.textContent = 'Your cart is empty — ask me to find a laptop and add it to your cart!';
    wrapper.appendChild(empty);
    block.appendChild(wrapper);
    return;
  }

  const shippingThreshold = cart?.free_shipping_threshold_usd;
  if (typeof shippingThreshold === 'number') {
    const shipping = document.createElement('div');
    shipping.className = 'asus-cart-shipping asus-fade-in-up';
    const label = document.createElement('span');
    label.className = 'asus-cart-shipping-label';
    label.textContent = cart.qualifies_free_shipping
      ? '🎉 You unlocked free shipping!'
      : `Add ${formatPrice(cart.free_shipping_remaining_usd)} more for free shipping`;
    const track = document.createElement('div');
    track.className = 'asus-cart-shipping-track';
    const fill = document.createElement('div');
    fill.className = 'asus-cart-shipping-fill';
    const pct = Math.min(100, Math.round(((cart.subtotal_usd || 0) / shippingThreshold) * 100));
    fill.style.width = `${pct}%`;
    track.appendChild(fill);
    shipping.appendChild(label);
    shipping.appendChild(track);
    wrapper.appendChild(shipping);
  }

  const list = document.createElement('div');
  list.className = 'asus-cart-list';

  const productItems = items.filter((i) => i.item_type !== 'warranty');
  const warrantyItems = items.filter((i) => i.item_type === 'warranty');

  productItems.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'asus-cart-row asus-editorial-panel asus-fade-in-up';
    row.style.animationDelay = `${i * 50}ms`;

    const thumb = document.createElement('div');
    thumb.className = 'asus-cart-thumb';
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      img.onerror = () => { thumb.style.background = '#f0efec'; img.remove(); };
      thumb.appendChild(img);
    } else {
      thumb.style.background = 'linear-gradient(135deg, #378ef0, #00000022)';
    }
    row.appendChild(thumb);

    const info = document.createElement('div');
    info.className = 'asus-cart-info';
    const name = document.createElement('span');
    name.className = 'asus-cart-name asus-editorial-name';
    name.textContent = item.name || '';
    const price = document.createElement('span');
    price.className = 'asus-cart-unit-price asus-editorial-muted';
    price.textContent = `${formatPrice(item.price_usd)} each`;
    info.appendChild(name);
    info.appendChild(price);
    row.appendChild(info);

    const stepper = document.createElement('div');
    stepper.className = 'asus-cart-stepper';

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'asus-cart-step-btn';
    minusBtn.textContent = '−';
    minusBtn.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
    if (bridge) {
      minusBtn.addEventListener('click', () => bridge.sendMessage(
        cartInstruction(sessionId, item.quantity <= 1
          ? `remove "${item.name}"`
          : `set the quantity of "${item.name}" to ${item.quantity - 1}`),
      ));
    }
    stepper.appendChild(minusBtn);

    const qty = document.createElement('span');
    qty.className = 'asus-cart-qty';
    qty.textContent = String(item.quantity);
    stepper.appendChild(qty);

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'asus-cart-step-btn';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', `Increase quantity of ${item.name}`);
    if (bridge) {
      plusBtn.addEventListener('click', () => bridge.sendMessage(
        cartInstruction(sessionId, `set the quantity of "${item.name}" to ${item.quantity + 1}`),
      ));
    }
    stepper.appendChild(plusBtn);

    row.appendChild(stepper);

    const lineTotal = document.createElement('span');
    lineTotal.className = 'asus-cart-line-total';
    lineTotal.textContent = formatPrice(item.price_usd * item.quantity);
    row.appendChild(lineTotal);

    list.appendChild(row);

    // Nested warranty plan sub-rows attached to this product — lighter
    // visual treatment (shield icon, no thumbnail) than a full laptop row.
    warrantyItems
      .filter((w) => w.for_product_id === item.product_id)
      .forEach((w) => {
        const subRow = document.createElement('div');
        subRow.className = 'asus-cart-warranty-row asus-fade-in-up';

        const icon = document.createElement('span');
        icon.className = 'asus-cart-warranty-icon';
        icon.textContent = '🛡️';
        subRow.appendChild(icon);

        const wName = document.createElement('span');
        wName.className = 'asus-cart-warranty-name';
        wName.textContent = w.name || '';
        subRow.appendChild(wName);

        const wPrice = document.createElement('span');
        wPrice.className = 'asus-cart-warranty-price';
        wPrice.textContent = formatPrice(w.price_usd);
        subRow.appendChild(wPrice);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'asus-cart-warranty-remove';
        removeBtn.setAttribute('aria-label', `Remove ${w.name}`);
        removeBtn.textContent = '✕';
        if (bridge) {
          removeBtn.addEventListener('click', () => bridge.sendMessage(
            cartInstruction(sessionId, `remove the "${w.name}" protection plan for "${item.name}"`),
          ));
        }
        subRow.appendChild(removeBtn);

        list.appendChild(subRow);
      });

    // Inline warranty upsell prompt — shown when view_cart flags this
    // product line with warranty_upsell: true (no plan attached yet).
    if (item.warranty_upsell === true) {
      const upsell = document.createElement('div');
      upsell.className = 'asus-cart-upsell asus-editorial-tint asus-fade-in-up';

      const upsellText = document.createElement('span');
      upsellText.className = 'asus-cart-upsell-text';
      upsellText.textContent = `🛡️ Protect your ${item.name} with ASUS Premium Care`;
      upsell.appendChild(upsellText);

      const upsellBtn = document.createElement('button');
      upsellBtn.type = 'button';
      upsellBtn.className = 'asus-cart-upsell-btn asus-pill-cta asus-pill-cta--outline asus-pill-cta--small';
      upsellBtn.textContent = 'View plans';
      if (bridge) {
        upsellBtn.addEventListener('click', () => bridge.sendMessage(`Show me warranty options for the ${item.name}`));
      }
      upsell.appendChild(upsellBtn);

      list.appendChild(upsell);
    }
  });
  wrapper.appendChild(list);

  const footer = document.createElement('div');
  footer.className = 'asus-cart-footer';

  const subtotal = document.createElement('span');
  subtotal.className = 'asus-cart-subtotal';
  subtotal.textContent = `Subtotal: ${formatPrice(cart.subtotal_usd || 0)}`;
  footer.appendChild(subtotal);

  const checkoutBtn = document.createElement('button');
  checkoutBtn.type = 'button';
  checkoutBtn.className = 'asus-cart-checkout asus-pill-cta asus-press';
  checkoutBtn.textContent = 'Checkout';
  if (bridge) {
    checkoutBtn.addEventListener('click', () => bridge.sendMessage(cartInstruction(sessionId, 'check out')));
  }
  footer.appendChild(checkoutBtn);

  wrapper.appendChild(footer);
  block.appendChild(wrapper);
}

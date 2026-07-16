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
    empty.className = 'asus-cart-empty';
    empty.textContent = 'Your cart is empty — ask me to find a laptop and add it to your cart!';
    wrapper.appendChild(empty);
    block.appendChild(wrapper);
    return;
  }

  const list = document.createElement('div');
  list.className = 'asus-cart-list';

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'asus-cart-row';

    const thumb = document.createElement('div');
    thumb.className = 'asus-cart-thumb';
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { thumb.style.background = '#1a1a1a'; img.remove(); };
      thumb.appendChild(img);
    } else {
      thumb.style.background = 'linear-gradient(135deg, #378ef0, #00000022)';
    }
    row.appendChild(thumb);

    const info = document.createElement('div');
    info.className = 'asus-cart-info';
    const name = document.createElement('span');
    name.className = 'asus-cart-name';
    name.textContent = item.name || '';
    const price = document.createElement('span');
    price.className = 'asus-cart-unit-price';
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
  checkoutBtn.className = 'asus-cart-checkout';
  checkoutBtn.textContent = 'Checkout';
  if (bridge) {
    checkoutBtn.addEventListener('click', () => bridge.sendMessage(cartInstruction(sessionId, 'check out')));
  }
  footer.appendChild(checkoutBtn);

  wrapper.appendChild(footer);
  block.appendChild(wrapper);
}

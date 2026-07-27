import { formatPrice } from '../../scripts/asus-brand.js';

const SAMPLE_CONFIRMATION = {
  session_id: 'sess_preview-demo',
  order_id: 'ASUS-2026-48213',
  items: [
    { product_id: 'tuf-gaming-a15-fa507', name: 'TUF Gaming A15 (FA507)', price_usd: 999, quantity: 1 },
    { product_id: 'rog-gladius-iii-mouse', name: 'ROG Gladius III Wireless Mouse', price_usd: 99, quantity: 1 },
  ],
  item_count: 2,
  subtotal_usd: 1098,
  qualifies_free_shipping: false,
  free_shipping_remaining_usd: 402,
  checkout_note: 'Demo checkout — no real order was placed. Connect an ASUS/Adobe Commerce order API to go live.',
};

export default async function decorate(block, bridge) {
  let order;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      order = SAMPLE_CONFIRMATION;
    } else {
      const _result = await bridge.toolResult;
      order = _result?.structuredContent || _result || {};
    }
  } else {
    order = SAMPLE_CONFIRMATION;
  }

  block.textContent = '';
  renderConfirmation(block, order, bridge);

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

function renderCheckmark() {
  const wrap = document.createElement('div');
  wrap.className = 'checkout-confirmation-badge asus-pop-in';
  wrap.innerHTML = `
    <svg viewBox="0 0 52 52" class="checkout-confirmation-checkmark" aria-hidden="true">
      <circle class="checkout-confirmation-circle" cx="26" cy="26" r="24" fill="none" />
      <path class="checkout-confirmation-check" fill="none" d="M14 27l7 7 17-17" />
    </svg>
  `;
  return wrap;
}

function renderConfirmation(block, order, bridge) {
  const items = order?.items || [];

  const card = document.createElement('div');
  card.className = 'checkout-confirmation-card';

  card.appendChild(renderCheckmark());

  const title = document.createElement('h2');
  title.className = 'checkout-confirmation-title asus-fade-in-up';
  title.style.animationDelay = '120ms';
  title.textContent = items.length ? 'Order Confirmed!' : 'Nothing to confirm yet';
  card.appendChild(title);

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'checkout-confirmation-note';
    empty.textContent = 'Add something to your cart and check out to see your order summary here.';
    card.appendChild(empty);
    block.appendChild(card);
    return;
  }

  if (order.order_id) {
    const orderId = document.createElement('p');
    orderId.className = 'checkout-confirmation-order-id asus-fade-in-up';
    orderId.style.animationDelay = '160ms';
    orderId.textContent = `Order #${order.order_id}`;
    card.appendChild(orderId);
  }

  const summary = document.createElement('div');
  summary.className = 'checkout-confirmation-summary asus-editorial-tint asus-fade-in-up';
  summary.style.animationDelay = '200ms';

  const list = document.createElement('div');
  list.className = 'checkout-confirmation-list';
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'checkout-confirmation-row';
    const name = document.createElement('span');
    name.className = 'checkout-confirmation-item-name';
    name.textContent = `${item.quantity}× ${item.name}`;
    const price = document.createElement('span');
    price.className = 'checkout-confirmation-item-price';
    price.textContent = formatPrice(item.price_usd * item.quantity);
    row.appendChild(name);
    row.appendChild(price);
    list.appendChild(row);
  });
  summary.appendChild(list);

  const totalRow = document.createElement('div');
  totalRow.className = 'checkout-confirmation-total';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total';
  const totalValue = document.createElement('span');
  totalValue.textContent = formatPrice(order.subtotal_usd || 0);
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalValue);
  summary.appendChild(totalRow);

  card.appendChild(summary);

  if (order.qualifies_free_shipping) {
    const banner = document.createElement('p');
    banner.className = 'checkout-confirmation-shipping asus-fade-in-up';
    banner.style.animationDelay = '260ms';
    banner.textContent = '🎉 This order shipped free!';
    card.appendChild(banner);
  }

  const reassurance = document.createElement('p');
  reassurance.className = 'checkout-confirmation-reassurance asus-fade-in-up';
  reassurance.style.animationDelay = '300ms';
  reassurance.textContent = 'A confirmation email is on its way. Your new ASUS gear will ship soon — welcome to the family.';
  card.appendChild(reassurance);

  if (order.checkout_note) {
    const note = document.createElement('p');
    note.className = 'checkout-confirmation-note';
    note.textContent = order.checkout_note;
    card.appendChild(note);
  }

  const ctaRow = document.createElement('div');
  ctaRow.className = 'checkout-confirmation-cta-row';

  const continueBtn = document.createElement('button');
  continueBtn.type = 'button';
  continueBtn.className = 'checkout-confirmation-cta asus-pill-cta asus-pill-cta--block asus-press';
  continueBtn.textContent = 'Continue Shopping';
  if (bridge) {
    continueBtn.addEventListener('click', () => bridge.sendMessage('Show me more ASUS laptops'));
  }
  ctaRow.appendChild(continueBtn);
  card.appendChild(ctaRow);

  block.appendChild(card);
}

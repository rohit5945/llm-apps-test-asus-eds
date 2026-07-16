// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'ASUS Zenbook DUO (UX8407)', description: 'Dual 3K Lumina Pro OLED laptop with Intel Core Ultra Series 3, 18+ hr battery, and durable Ceraluminum chassis.', image_url: 'https://dlcdnwebimgs.asus.com/gain/cee1353c-a974-4436-9235-ce4443f58285/w800/fwebp', category: 'Zenbook Duo' },
  { name: 'ASUS Zenbook 14 (UX3480); Copilot+ PC', description: 'Lightweight 14-inch Copilot+ PC in the Zenbook family.', image_url: 'https://dlcdnwebimgs.asus.com/gain/696b867d-2d95-4af2-b2d4-0ad7799ef495/w800/fwebp', category: 'Zenbook' },
  { name: 'ASUS Zenbook A16 (UX3607); Copilot+ PC', description: '16-inch Zenbook A-series Copilot+ PC.', image_url: 'https://dlcdnwebimgs.asus.com/gain/ec3e3399-c34a-4ed9-be76-c9be1ac1ca6e/w800/fwebp', category: 'Zenbook A' },
  { name: 'ASUS Zenbook A14 (UX3407); Copilot+ PC', description: 'Ultralight 14-inch Zenbook A-series Copilot+ PC.', image_url: 'https://dlcdnwebimgs.asus.com/gain/daf7ed78-fcec-4f54-82a6-db3204fdece3/w800/fwebp', category: 'Zenbook A' },
  { name: 'ASUS Zenbook S16 (UX5606); Copilot+ PC', description: 'Premium 16-inch Zenbook S-series Copilot+ PC.', image_url: 'https://dlcdnwebimgs.asus.com/gain/8264ddf7-ccc7-4b11-b18d-360f92049814/w800/fwebp', category: 'Zenbook S' },
  { name: 'ASUS Zenbook S14 (UX5406); Copilot+ PC', description: 'Premium 14-inch Zenbook S-series Copilot+ PC.', image_url: 'https://dlcdnwebimgs.asus.com/gain/827c5809-1d54-487a-aad4-9b5c0aee3fb8/w800/fwebp', category: 'Zenbook S' },
  { name: 'ASUS Zenbook 14 (UM3406ZA)', description: '14-inch Zenbook laptop.', image_url: 'https://dlcdnwebimgs.asus.com/gain/1474e646-c89a-484b-b052-e3e2e46a1e5a/w800/fwebp', category: 'Zenbook' },
];

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
const PALETTE = ['#006ce1'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const ACCENT = PALETTE[0] || '#006ce1';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — derived from action name "search_products" (bare array outputSchema rule)
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
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
  const list = (items || []).slice(0, 5);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  list.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'search-products-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
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
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'search-products-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    if (item.category) {
      const badgeRow = document.createElement('div');
      badgeRow.className = 'search-products-badge-row';
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.style.background = ACCENT;
      badge.textContent = item.category;
      badgeRow.appendChild(badge);
      info.appendChild(badgeRow);
    }

    const btn = document.createElement('button');
    btn.className = 'search-products-cta';
    btn.type = 'button';
    btn.style.background = ACCENT;
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

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

  const cardStep = 220 + 16;
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

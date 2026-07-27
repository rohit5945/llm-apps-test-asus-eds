/**
 * Shared sample data for standalone/preview mode across widget blocks.
 * In production, real data comes from bridge.toolResult (see the
 * corresponding action in the llm-apps-test-asus repo's actions/lib/catalog.js
 * — field names here must stay in sync with that module's `toCard()` shape).
 *
 * Refreshed July 2026 to mirror the real ASUS catalog (see lib/catalog.js in
 * the backend repo) so preview mode looks like the real, live experience
 * instead of placeholder data. Extended again alongside the editorial
 * redesign to cover the new warranty-options widget and the cart's
 * warranty upsell / nested warranty line items (see lib/cart.js's
 * annotateWarrantyUpsell + addWarrantyItem in the backend repo).
 */

export const SAMPLE_PRODUCTS = [
  {
    id: 'zenbook-duo-ux8407-2026',
    name: 'ASUS Zenbook DUO (UX8407)',
    description: 'The dual 14" 3K OLED screen laptop with the fastest graphics, longest battery, and next-gen AI in the Zenbook DUO line.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/9fe03e85-4f8e-416e-bdea-2eb8879361aa/',
    category: 'Zenbook Duo',
    brand_line: 'zenbook',
    series: 'Zenbook Duo',
    price_usd: 2299,
    cpu: 'Intel Core Ultra X9 388H',
    gpu: 'Intel Arc B390',
    gpu_tier: 'mid',
    ram_gb: 32,
    storage_gb: 1024,
    screen_size_in: 14,
    weight_kg: 1.65,
    battery_hours: 18,
    rating: 4.6,
    review_count: 129,
    in_stock: true,
    use_cases: ['productivity', 'creator', 'business'],
    highlights: ['Dual 14" 3K OLED displays, 120Hz', 'Detachable backlit keyboard', 'Intel Core Ultra X9 388H + Intel Arc B390 graphics'],
    fallback_color: '#1F3A5C',
    buy_url: 'https://www.asus.com/us/laptops/for-home/zenbook/asus-zenbook-duo-ux8407/',
  },
  {
    id: 'rog-zephyrus-g14-2025',
    name: 'ROG Zephyrus G14 (2025)',
    description: 'The lightest ROG laptop ASUS has ever built — an ultra-slim 14" gaming laptop with an RTX 5080 and AI accelerators built into both CPU and GPU.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/BA146EC2-FF9D-4A8E-A91A-C9F864DE6BBB',
    category: 'ROG Zephyrus',
    brand_line: 'rog',
    series: 'ROG Zephyrus',
    price_usd: 2499,
    cpu: 'AMD Ryzen AI 9 HX 370',
    gpu: 'NVIDIA GeForce RTX 5080',
    gpu_tier: 'high',
    ram_gb: 32,
    storage_gb: 2048,
    screen_size_in: 14,
    weight_kg: 1.5,
    battery_hours: 10,
    rating: 4.8,
    review_count: 64,
    in_stock: true,
    use_cases: ['gaming', 'creator'],
    highlights: ['14" 3K OLED, 120Hz, ROG Nebula HDR Display', 'NVIDIA GeForce RTX 5080 Laptop GPU', 'Only 1.5kg — the lightest ROG ever made'],
    fallback_color: '#E2231A',
    buy_url: 'https://rog.asus.com/us/laptops/rog-zephyrus/rog-zephyrus-g14-2025/',
  },
  {
    id: 'tuf-gaming-a16-2025',
    name: 'TUF Gaming A16 (2025)',
    description: '"Robust Performance, Elevated Victory" — a MIL-STD-810H durable gaming laptop with 0dB Ambient Cooling and dependable RTX 50-series graphics at a value price.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/c0b28d76-4515-4965-9982-18898fdd5208/w800',
    category: 'TUF Gaming',
    brand_line: 'tuf',
    series: 'TUF Gaming',
    price_usd: 1399,
    cpu: 'AMD Ryzen 9 8940HX',
    gpu: 'NVIDIA GeForce RTX 5060',
    gpu_tier: 'entry',
    ram_gb: 16,
    storage_gb: 1024,
    screen_size_in: 16,
    weight_kg: 2.2,
    battery_hours: 9,
    rating: 4.4,
    review_count: 206,
    in_stock: true,
    use_cases: ['gaming', 'budget'],
    highlights: ['16" FHD+ 165Hz, G-Sync', 'NVIDIA GeForce RTX 5060 Laptop GPU', 'MIL-STD-810H military-grade durability'],
    fallback_color: '#F2A900',
    buy_url: 'https://www.asus.com/us/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/',
  },
  {
    id: 'proart-px13-hn7306',
    name: 'ASUS ProArt PX13 (HN7306)',
    description: '"Your ultimate portable studio" — a 360° convertible creator laptop with 64GB of unified memory for unstoppable on-the-go AI and content work.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/e94a421e-3a3b-4350-beb0-3215e70aa17a/',
    category: 'ProArt PX',
    brand_line: 'proart',
    series: 'ProArt PX',
    price_usd: 2799,
    cpu: 'AMD Ryzen AI Max+ 395',
    gpu: 'AMD Radeon Graphics (unified)',
    gpu_tier: 'integrated',
    ram_gb: 64,
    storage_gb: 1024,
    screen_size_in: 13.3,
    weight_kg: 1.39,
    battery_hours: 10,
    rating: 4.7,
    review_count: 41,
    in_stock: true,
    use_cases: ['creator', 'professional'],
    highlights: ['64GB unified memory — "Unstoppable AI"', '13.3" 3K OLED touchscreen, 360° convertible', 'AMD Ryzen AI Max+ 395, 16 cores'],
    fallback_color: '#C9A227',
    buy_url: 'https://www.asus.com/us/laptops/for-creators/proart/proart-px13-hn7306/',
  },
  {
    id: 'vivobook-s14-m5406',
    name: 'ASUS Vivobook S14 (M5406)',
    description: '"Everyday, elevated" — a Copilot+ PC with a sleek minimalist design and a bright OLED display for school and work.',
    image_url: 'https://dlcdnwebimgs.asus.com/gain/496ec5ea-48e1-4c76-bbff-9f5de8368036/',
    category: 'Vivobook S',
    brand_line: 'vivobook',
    series: 'Vivobook S',
    price_usd: 1199,
    cpu: 'AMD Ryzen AI 9 HX 370',
    gpu: 'AMD Radeon Graphics (integrated)',
    gpu_tier: 'integrated',
    ram_gb: 16,
    storage_gb: 512,
    screen_size_in: 14,
    weight_kg: 1.4,
    battery_hours: 12,
    rating: 4.4,
    review_count: 87,
    in_stock: true,
    use_cases: ['student', 'productivity', 'business'],
    highlights: ['14" 3K OLED, 120Hz', 'Copilot+ PC AI features', 'AMD Ryzen AI 9 HX 370'],
    fallback_color: '#7B2FF7',
    buy_url: 'https://www.asus.com/us/laptops/for-home/vivobook/',
  },
];

/**
 * Sample cart payload for the cart widget's preview mode. Mirrors
 * view-cart's real shape: a `warranty_upsell: true` hint on the
 * unprotected TUF laptop line, a real `item_type: 'warranty'` sub-line
 * already attached to the Zenbook DUO (for_product_id), and the
 * Zenbook DUO's own product line carrying `warranty_upsell: false`
 * since it's already protected.
 */
export const SAMPLE_CART = {
  session_id: 'sess_preview-demo',
  items: [
    {
      item_type: 'product', product_id: 'tuf-gaming-a16-2025', name: 'TUF Gaming A16 (2025)', price_usd: 1399, image_url: 'https://dlcdnwebimgs.asus.com/gain/c0b28d76-4515-4965-9982-18898fdd5208/w800', quantity: 1, warranty_upsell: true,
    },
    {
      item_type: 'product', product_id: 'zenbook-duo-ux8407-2026', name: 'ASUS Zenbook DUO (UX8407)', price_usd: 2299, image_url: 'https://dlcdnwebimgs.asus.com/gain/9fe03e85-4f8e-416e-bdea-2eb8879361aa/', quantity: 1, warranty_upsell: false,
    },
    {
      item_type: 'warranty', plan_id: 'apc-3yr-adp', name: 'ASUS Premium Care — 3-Year Extension + Accidental Damage Protection (ADP)', price_usd: 209.99, quantity: 1, for_product_id: 'zenbook-duo-ux8407-2026',
    },
  ],
  item_count: 3,
  subtotal_usd: 3907.99,
  free_shipping_threshold_usd: 1500,
  free_shipping_remaining_usd: 0,
  qualifies_free_shipping: true,
};

/** Sample recommendations payload for the recommendations widget's preview mode. */
export const SAMPLE_RECOMMENDATIONS = {
  based_on: 'product',
  recommendations: [
    { ...SAMPLE_PRODUCTS[2], reason: 'Also popular in the TUF Gaming line' },
    {
      id: 'rog-gladius-iii-mouse',
      name: 'ROG Gladius III Wireless Mouse',
      description: 'Lightweight wireless gaming mouse with swappable switches and Aura Sync RGB.',
      image_url: null,
      category: 'Gaming Mouse',
      brand_line: 'rog',
      price_usd: 99,
      rating: 4.7,
      review_count: 340,
      in_stock: true,
      is_accessory: true,
      fallback_color: '#E2231A',
      reason: 'Frequently bought with TUF Gaming A16',
    },
    {
      id: 'asus-portable-ssd-1tb',
      name: 'ASUS 1TB Portable SSD',
      description: 'Pocket-sized 1TB USB-C SSD with up to 1050MB/s transfer speeds.',
      image_url: null,
      category: 'Storage',
      brand_line: 'vivobook',
      price_usd: 89,
      rating: 4.6,
      review_count: 275,
      in_stock: true,
      is_accessory: true,
      fallback_color: '#7B2FF7',
      reason: 'Frequently bought with TUF Gaming A16',
    },
  ],
};

/** Sample product context for the warranty-options widget's preview mode. */
export const SAMPLE_WARRANTY_PRODUCT = { ...SAMPLE_PRODUCTS[2] };

/**
 * Sample ASUS Premium Care (APC) plans for the warranty-options widget's
 * preview mode — mirrors WARRANTY_PLANS in the backend repo's
 * lib/catalog.js exactly (id, name, provider, duration_years, price_usd,
 * includes_adp, covers[], description).
 */
export const SAMPLE_WARRANTY_PLANS = [
  {
    id: 'apc-1yr',
    name: 'ASUS Premium Care — 1-Year Extension',
    provider: 'ASUS Premium Care (APC)',
    duration_years: 1,
    price_usd: 79.99,
    includes_adp: false,
    covers: ['Warranty extension only (no accidental damage)'],
    description: 'Extends ASUS\'s standard warranty on this laptop by 1 year. Does not cover accidental damage.',
  },
  {
    id: 'apc-2yr',
    name: 'ASUS Premium Care — 2-Year Extension',
    provider: 'ASUS Premium Care (APC)',
    duration_years: 2,
    price_usd: 149.99,
    includes_adp: false,
    covers: ['Warranty extension only (no accidental damage)'],
    description: 'Extends ASUS\'s standard warranty on this laptop by 2 years. Does not cover accidental damage.',
  },
  {
    id: 'apc-3yr-adp',
    name: 'ASUS Premium Care — 3-Year Extension + Accidental Damage Protection (ADP)',
    provider: 'ASUS Premium Care (APC)',
    duration_years: 3,
    price_usd: 209.99,
    includes_adp: true,
    covers: ['Warranty extension', 'Accidental Damage Protection (ADP): drops, spills, electrical surges, cracked LCD'],
    description: 'Extends ASUS\'s standard warranty on this laptop by 3 years and adds Accidental Damage Protection (ADP) for drops, spills, electrical surges, and cracked LCD screens.',
  },
];

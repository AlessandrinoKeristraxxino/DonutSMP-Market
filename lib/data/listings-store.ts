import { DEMO_LISTINGS, DemoListing, DEMO_USERS, DemoUser } from './mock-db';

export interface ListingWithAuthor extends DemoListing {
  author: DemoUser;
}

const STORAGE_KEY = 'donut_smp_listings_v1';

// Seed initial listings with extended items for realistic testing
export const INITIAL_LISTINGS: DemoListing[] = [
  ...DEMO_LISTINGS,
  // Additional Map Art
  {
    id: 'list-art-3',
    userId: 'u-2',
    section: 'MAP_ART',
    kind: 'ARTWORK',
    title: 'Void Dragon Sovereign (Staircase 3D)',
    description: `### Hand-Crafted Staircase Ender Dragon Artwork

- **Dimensions:** 3×3 (9 map items total)
- **Palette Technique:** Obsidian, crying obsidian, purple glazed terracotta, and sea lanterns for dynamic glow
- **Stock:** 2 pre-framed sets available in vault

Safe trade at \`/spawn\` trading district. Both buyer and seller must confirm in-game drop.`,
    price: 1_850_000n,
    isNegotiable: false,
    isFulfilled: false,
    isPaused: false,
    details: {
      mapSize: '3×3',
      copiesInStock: 2,
      tags: ['Dragon', 'Void', 'Staircase', 'Glow'],
    },
    images: ['https://picsum.photos/seed/voiddragon/800/800'],
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'list-art-4',
    userId: 'u-2',
    section: 'MAP_ART',
    kind: 'ARTWORK',
    title: 'Neon Cyberpunk Samurai',
    description: `Compact 1×1 wall piece with high-contrast neon cyan and glazed magenta.
Ideal for shop fronts or vault entrances.

- Hand-checked pixel grid
- Zero corruption
- Ready for instant pickup`,
    price: 320_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      mapSize: '1×1',
      copiesInStock: 5,
      tags: ['Cyberpunk', '1x1', 'Neon', 'Anime'],
    },
    images: ['https://picsum.photos/seed/neonsamurai/800/800'],
    createdAt: '2026-10-16T11:00:00Z',
  },
  // Additional Market Buy/Sell listings
  {
    id: 'list-mkt-3',
    userId: 'u-1',
    section: 'MARKET',
    kind: 'SELL',
    title: 'Tier 3 Zombie Villager Spawners (x2)',
    description: `Selling a matched pair of Zombie Spawners for iron golem / trading hall setups.

- 1.4M $ each or 2.6M $ for both
- Verified untouched since mining`,
    price: 1_400_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      category: 'Spawners',
      quantity: 2,
      unitPrice: 1_400_000n,
      isBundleOnly: false,
    },
    images: ['https://picsum.photos/seed/zombiespawner/800/800'],
    createdAt: '2026-10-16T12:00:00Z',
  },
  {
    id: 'list-mkt-4',
    userId: 'u-3',
    section: 'MARKET',
    kind: 'BUY',
    title: 'WTB: Shulker Shells Bulk (10 Stacks)',
    description: `Looking to buy 10 stacks of Shulker Shells (640 total) for megabase storage expansion.

Paying **320k $ per stack** (3.2M $ total).
Message me for instant trade.`,
    price: 3_200_000n,
    isNegotiable: false,
    isFulfilled: false,
    isPaused: false,
    details: {
      category: 'Resources',
      quantity: 640,
      unitPrice: 5_000n,
      isBundleOnly: true,
    },
    images: ['https://picsum.photos/seed/shulkershells/800/800'],
    createdAt: '2026-10-16T13:45:00Z',
  },
  {
    id: 'list-mkt-5',
    userId: 'u-1',
    section: 'MARKET',
    kind: 'SELL',
    title: 'God Apple & Enchanted Totem Bundle',
    description: `Combat readiness bundle:
- 8x Enchanted Golden Apples
- 16x Totems of Undying

Price for full bundle: 1.1M $ in-game currency.`,
    price: 1_100_000n,
    isNegotiable: false,
    isFulfilled: false,
    isPaused: false,
    details: {
      category: 'Misc',
      quantity: 24,
      unitPrice: 45_833n,
      isBundleOnly: true,
    },
    images: ['https://picsum.photos/seed/godapple/800/800'],
    createdAt: '2026-10-16T14:10:00Z',
  },
  // Additional Build Services & Requests
  {
    id: 'list-bld-2',
    userId: 'u-3',
    section: 'BUILD',
    kind: 'SERVICE',
    title: 'Megabase Exterior & Structural Framing',
    description: `Offering full architectural megabase construction.

- **Styles:** Brutalist obsidian, gothic cathedral, futuristic sci-fi dome
- **Turnaround:** 7–14 days depending on scale
- **Pricing:** Quote-based depending on radius and block palette`,
    price: null, // Quote-only
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      buildTypes: ['Base', 'Decorative'],
      turnaroundDays: 14,
    },
    images: ['https://picsum.photos/seed/megabaseexterior/800/800'],
    createdAt: '2026-10-14T16:00:00Z',
  },
  {
    id: 'list-bld-3',
    userId: 'u-1',
    section: 'BUILD',
    kind: 'REQUEST',
    title: 'Need Builder: 100×100 Perimeter Glass Ceiling & Lighting',
    description: `Looking for a builder or team to install a 100×100 tinted glass dome with automated redstone lamp day/night lighting at my base.

- Materials will be supplied in locked chests
- Target completion: within 4 days
- Budget: Up to **2.2M $**`,
    price: 2_200_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      buildTypes: ['Base', 'Redstone'],
      budgetMax: 2_200_000n,
      deadline: '4 days',
    },
    images: ['https://picsum.photos/seed/perimeterceiling/800/800'],
    createdAt: '2026-10-16T15:20:00Z',
  },
];

export function getStoredListings(): DemoListing[] {
  if (typeof window === 'undefined') {
    return INITIAL_LISTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeListings(INITIAL_LISTINGS)));
      return INITIAL_LISTINGS;
    }
    return deserializeListings(JSON.parse(raw));
  } catch {
    return INITIAL_LISTINGS;
  }
}

export function saveStoredListings(listings: DemoListing[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeListings(listings)));
  } catch (err) {
    console.error('Failed to save listings to localStorage', err);
  }
}

export function getListingWithAuthor(listing: DemoListing): ListingWithAuthor {
  const author = DEMO_USERS.find((u) => u.id === listing.userId) || DEMO_USERS[0];
  return { ...listing, author };
}

// Helpers for BigInt JSON serialization
function serializeListings(listings: DemoListing[]): any[] {
  return listings.map((l) => ({
    ...l,
    price: l.price !== null && l.price !== undefined ? l.price.toString() : null,
    details: serializeDetails(l.details),
  }));
}

function deserializeListings(data: any[]): DemoListing[] {
  return data.map((l) => ({
    ...l,
    price: l.price !== null && l.price !== undefined ? BigInt(l.price) : null,
    details: deserializeDetails(l.details),
  }));
}

function serializeDetails(details: Record<string, any>): Record<string, any> {
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(details || {})) {
    if (typeof v === 'bigint') {
      res[k] = v.toString();
    } else {
      res[k] = v;
    }
  }
  return res;
}

function deserializeDetails(details: Record<string, any>): Record<string, any> {
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(details || {})) {
    if (typeof v === 'string' && /^\d+$/.test(v) && (k.includes('Price') || k.includes('budget') || k.includes('Budget'))) {
      res[k] = BigInt(v);
    } else {
      res[k] = v;
    }
  }
  return res;
}

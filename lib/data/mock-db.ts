/**
 * Mock database state and seed for Donut SMP Marketplace.
 * Provides typed in-memory stores and mutation helpers for local execution,
 * matching the Prisma schema entities.
 */

export interface DemoUser {
  id: string;
  name: string;
  minecraftIgn: string;
  discordId: string;
  role: 'USER' | 'MOD' | 'ADMIN';
  bio: string;
  avatarUrl: string;
  positiveVouches: number;
  negativeVouches: number;
  completedOrders: number;
  memberSince: string;
  isBanned?: boolean;
  tradePreferences?: {
    safeDropLocation?: string;
    preferredLobby?: string;
  };
}

export interface DemoListing {
  id: string;
  userId: string;
  section: 'MAP_ART' | 'MARKET' | 'BUILD';
  kind: 'ARTWORK' | 'COMMISSION_OFFER' | 'SELL' | 'BUY' | 'SERVICE' | 'REQUEST';
  title: string;
  description: string; // Markdown
  price: bigint | null;
  isNegotiable: boolean;
  isFulfilled: boolean;
  isPaused: boolean;
  details: Record<string, any>;
  images: string[];
  createdAt: string;
}

export interface DemoOrder {
  id: string;
  orderNumber: number;
  type: 'MAP_ART' | 'TRADE' | 'BUILD';
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  buyerId: string;
  sellerId: string;
  listingId?: string;
  agreedPrice: bigint;
  agreedQuantity: number;
  itemOrService: string;
  buyerPaidInGame: boolean;
  sellerReceivedInGame: boolean;
  createdAt: string;
  events: Array<{
    id: string;
    actorId: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
}

export interface DemoVouch {
  id: string;
  orderId: string;
  authorId: string;
  targetId: string;
  rating: 'POSITIVE' | 'NEGATIVE';
  content: string; // Markdown
  modStatus: 'APPROVED' | 'NEEDS_REVIEW' | 'REJECTED';
  images: string[];
  createdAt: string;
}

export interface DemoQuote {
  id: string;
  listingId: string;
  builderId: string;
  price: bigint;
  etaDays: number;
  message: string; // Markdown pitch
  isAccepted: boolean;
  createdAt: string;
}

export interface DemoAuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: 'USER' | 'LISTING' | 'ORDER' | 'VOUCH' | 'SYSTEM';
  targetId: string;
  details: string;
  createdAt: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u-1',
    name: 'VoidMiner',
    minecraftIgn: 'VoidMiner_X',
    discordId: 'VoidMiner#1234',
    role: 'USER',
    bio: 'End-grinder and spawner specialist on Donut SMP Season 5. Fast spawn dropoffs.',
    avatarUrl: 'https://picsum.photos/seed/voidminer/200/200',
    positiveVouches: 94,
    negativeVouches: 0,
    completedOrders: 112,
    memberSince: 'Oct 2024',
  },
  {
    id: 'u-2',
    name: 'PrismPixel',
    minecraftIgn: 'Prism_Art',
    discordId: 'Prism#8841',
    role: 'USER',
    bio: 'Dedicated map artist specializing in staircase 3D shading and anime/fantasy canvas commissions.',
    avatarUrl: 'https://picsum.photos/seed/prism/200/200',
    positiveVouches: 87,
    negativeVouches: 0,
    completedOrders: 92,
    memberSince: 'Aug 2024',
  },
  {
    id: 'u-3',
    name: 'ZephyrCraft',
    minecraftIgn: 'Zephyr_Builds',
    discordId: 'Zephyr#9900',
    role: 'USER',
    bio: 'Redstone architect & megabase contractor. Automatic gold, iron, and wither skull farms.',
    avatarUrl: 'https://picsum.photos/seed/zephyr/200/200',
    positiveVouches: 41,
    negativeVouches: 1,
    completedOrders: 48,
    memberSince: 'Dec 2024',
  },
  {
    id: 'u-4',
    name: 'Aegis Sentinel',
    minecraftIgn: 'Aegis_Guard',
    discordId: 'Aegis#0001',
    role: 'MOD',
    bio: 'Donut SMP Market Moderator. Enforcing anti-RMT rules, fair trade, and verified vouches.',
    avatarUrl: 'https://picsum.photos/seed/aegis/200/200',
    positiveVouches: 18,
    negativeVouches: 0,
    completedOrders: 24,
    memberSince: 'Jan 2024',
  },
  {
    id: 'u-5',
    name: 'DonutAdmin',
    minecraftIgn: 'Donut_Owner',
    discordId: 'Owner#0000',
    role: 'ADMIN',
    bio: 'Platform administration and server infrastructure.',
    avatarUrl: 'https://picsum.photos/seed/donutadmin/200/200',
    positiveVouches: 5,
    negativeVouches: 0,
    completedOrders: 6,
    memberSince: 'Jan 2024',
  },
];

export const DEMO_LISTINGS: DemoListing[] = [
  {
    id: 'list-art-1',
    userId: 'u-2',
    section: 'MAP_ART',
    kind: 'ARTWORK',
    title: 'Sunset over Obsidian Spire',
    description: `## Sunset over Obsidian Spire (Original Map Art)

- **Grid Size:** 2×2 Frames (4 map items total)
- **Palette Technique:** Hand-placed glass over stained clay with staircase depth shading
- **Server:** Built verified on Donut SMP Season 5

### Delivery Details
Packaged in a locked shulker box with certified map copies. Safe delivery at \`/spawn\` trading stalls or via secure locked chest hopper transfer.

> "Every pixel is hand-audited against in-game map colors."`,
    price: 850_000n,
    isNegotiable: false,
    isFulfilled: false,
    isPaused: false,
    details: {
      mapSize: '2×2',
      copiesInStock: 3,
      tags: ['Landscape', 'Staircase', 'Decorative'],
    },
    images: ['https://picsum.photos/seed/sunsetspire/800/800'],
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    id: 'list-art-2',
    userId: 'u-2',
    section: 'MAP_ART',
    kind: 'COMMISSION_OFFER',
    title: 'Custom Map Art Commissions (1×1 to 3×3)',
    description: `## Commission Slots Open

I build custom rendered map art directly on Donut SMP.

### Available Options
- **1×1 Frame:** 350k $ (1–2 days turnaround)
- **2×2 Frames:** 800k $ (3–5 days turnaround)
- **3×3 Frames:** 1.8M $ (7–10 days turnaround)

### Rules & Process
1. Client provides reference artwork via order request.
2. We confirm schematic preview before placing blocks.
3. In-game payment confirmed upon delivery of maps.`,
    price: 350_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      openSlots: 2,
      turnaroundDays: 4,
      tags: ['Commission', 'Custom', 'Any Size'],
    },
    images: ['https://picsum.photos/seed/commissionart/800/800'],
    createdAt: '2026-10-15T14:30:00Z',
  },
  {
    id: 'list-mkt-1',
    userId: 'u-1',
    section: 'MARKET',
    kind: 'SELL',
    title: 'Pig Spawners (Tier 2 Ready)',
    description: `Selling 4x Pig Spawners freshly mined from dungeon perimeters. Ready for high-volume passive porkchop grinders.

- Price: **1.25M $ per spawner** or **4.8M $ bundle for all 4**
- Drop location: Safe booth at Spawn Market 4B`,
    price: 1_250_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      category: 'Spawners',
      quantity: 4,
      unitPrice: 1_250_000n,
    },
    images: ['https://picsum.photos/seed/spawnerpig/800/800'],
    createdAt: '2026-10-16T08:00:00Z',
  },
  {
    id: 'list-mkt-2',
    userId: 'u-1',
    section: 'MARKET',
    kind: 'SELL',
    title: 'Max Enchants Netherite Armor Set',
    description: `Full 4-piece Netherite set with Protection IV, Unbreaking III, Mending, and Respiration III/Aqua Affinity/Depth Strider III.

Zero durability loss, ready for combat.`,
    price: 2_400_000n,
    isNegotiable: false,
    isFulfilled: false,
    isPaused: false,
    details: {
      category: 'Gear',
      quantity: 1,
      unitPrice: 2_400_000n,
    },
    images: ['https://picsum.photos/seed/netheritearmor/800/800'],
    createdAt: '2026-10-16T09:15:00Z',
  },
  {
    id: 'list-bld-1',
    userId: 'u-3',
    section: 'BUILD',
    kind: 'SERVICE',
    title: 'Automated 120k/hr Netherite Perimeter Gold Farm',
    description: `### Industrial Nether Gold & Bartering Machine

I build modular, server-optimized piglin gold farms designed to run flawlessly under Donut SMP tick conditions.

- **Rates:** 120,000+ nuggets and rotten flesh per hour
- **Materials:** Client supplies obsidian and magma blocks (or I source at market rate)
- **Turnaround:** 48 hours guaranteed

Submit a quote request with your nether roof coordinates.`,
    price: 3_500_000n,
    isNegotiable: true,
    isFulfilled: false,
    isPaused: false,
    details: {
      buildTypes: ['Farm', 'Redstone', 'Nether'],
      turnaroundDays: 3,
    },
    images: ['https://picsum.photos/seed/goldfarm/800/800'],
    createdAt: '2026-10-15T18:00:00Z',
  },
];

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'ord-1041',
    orderNumber: 1041,
    type: 'MAP_ART',
    status: 'COMPLETED',
    buyerId: 'u-3',
    sellerId: 'u-2',
    listingId: 'list-art-1',
    agreedPrice: 850_000n,
    agreedQuantity: 1,
    itemOrService: 'Sunset over Obsidian Spire (2×2)',
    buyerPaidInGame: true,
    sellerReceivedInGame: true,
    createdAt: '2026-10-12T11:00:00Z',
    events: [
      {
        id: 'ev-1',
        actorId: 'u-3',
        status: 'REQUESTED',
        note: 'Order placed for Sunset 2x2',
        createdAt: '2026-10-12T11:00:00Z',
      },
      {
        id: 'ev-2',
        actorId: 'u-2',
        status: 'ACCEPTED',
        note: 'Maps ready in vault',
        createdAt: '2026-10-12T11:15:00Z',
      },
      {
        id: 'ev-3',
        actorId: 'u-2',
        status: 'DELIVERED',
        note: 'Delivered at spawn booth 12',
        createdAt: '2026-10-12T12:00:00Z',
      },
      {
        id: 'ev-4',
        actorId: 'u-3',
        status: 'COMPLETED',
        note: 'Maps received and verified, payment sent in-game',
        createdAt: '2026-10-12T12:10:00Z',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        senderId: 'u-3',
        content: 'Meet at spawn booth 12 in 5 minutes?',
        createdAt: '2026-10-12T11:50:00Z',
      },
      {
        id: 'msg-2',
        senderId: 'u-2',
        content: 'Standing by booth 12 with the shulker now.',
        createdAt: '2026-10-12T11:55:00Z',
      },
    ],
  },
];

export const DEMO_VOUCHES: DemoVouch[] = [
  {
    id: 'vouch-1',
    orderId: 'ord-1041',
    authorId: 'u-3',
    targetId: 'u-2',
    rating: 'POSITIVE',
    content: `## Outstanding Map Art Quality

Purchased the **Sunset over Obsidian Spire** 2×2. The staircase palette shading looks phenomenal when placed in item frames at my base.

- Delivered in under 1 hour
- Secure trade at spawn
- Certified original copies

*10/10 would commission again.*`,
    modStatus: 'APPROVED',
    images: ['https://picsum.photos/seed/vouchproof1/800/800'],
    createdAt: '2026-10-12T12:30:00Z',
  },
];

export const DEMO_QUOTES: DemoQuote[] = [
  {
    id: 'quote-1',
    listingId: 'list-bld-3',
    builderId: 'u-3', // Zephyr_Builds
    price: 1_950_000n,
    etaDays: 3,
    message: `### Professional Perimeter Installation Proposal

I specialize in large-scale geometric glass ceilings and automated lighting grids.

- **Lighting Grid:** Daylight-detector synced inverted redstone lamps.
- **Glass Tint:** Seamless tinted glass with void-black borders.
- **Materials:** Verified using client chests at safe base perimeter.
- **Turnaround:** 72 hours from confirmation.`,
    isAccepted: false,
    createdAt: '2026-10-16T16:00:00Z',
  },
];

export const DEMO_AUDIT_LOGS: DemoAuditLog[] = [
  {
    id: 'log-1',
    actorId: 'u-5',
    action: 'SYSTEM_BOOTSTRAP',
    targetType: 'SYSTEM',
    targetId: 'sys-0',
    details: 'Marketplace initialized with zero-fiat anti-RMT moderation engine',
    createdAt: '2026-10-12T00:00:00Z',
  },
  {
    id: 'log-2',
    actorId: 'u-4',
    action: 'VOUCH_APPROVED',
    targetType: 'VOUCH',
    targetId: 'vouch-1',
    details: 'Verified in-game dropoff proof screenshot for Order #1041',
    createdAt: '2026-10-12T12:35:00Z',
  },
  {
    id: 'log-3',
    actorId: 'u-5',
    action: 'CONFIG_UPDATED',
    targetType: 'SYSTEM',
    targetId: 'sys-config',
    details: 'Automated spam and RMT keyword screening rules activated',
    createdAt: '2026-10-14T08:00:00Z',
  },
];

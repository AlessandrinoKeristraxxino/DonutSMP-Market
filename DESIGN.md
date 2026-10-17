# Donut SMP Marketplace — Design & Architectural Plan (DESIGN.md)

This document establishes the product architecture, data model, route taxonomy, visual language, design tokens, and anti-slop guidelines for the Donut SMP Marketplace, as specified in **Phase 0**.

---

## 1. Stack Confirmation & Folder Structure

### 1.1 Stack Confirmation
- **Framework**: Next.js 15+ (App Router) with TypeScript in strict mode (`tsconfig.json` strict: true).
- **Styling**: Tailwind CSS v4 via `@import "tailwindcss";` in `app/globals.css`. Design tokens mapped to CSS variables.
- **Icons**: `lucide-react` SVG icons only. No emojis as UI icons.
- **Motion**: `motion/react` for subtle state transitions and route continuity (respecting `prefers-reduced-motion`).
- **Database & ORM**: PostgreSQL with Prisma ORM. BigInt storage for all in-game currency values with `k`, `m`, `b` parsers and formatters.
- **Authentication**: Auth.js with Discord OAuth provider; profiles link Discord ID to Minecraft in-game username (IGN).
- **Validation**: Zod schemas for all mutations, queries, and JSON `details` columns.
- **Markdown & Security**: `react-markdown` + `remark-gfm` + `rehype-sanitize` with strict HTML-stripping, no remote images in Markdown, and `rel="nofollow noopener noreferrer ugc"` external links.
- **Image Pipeline**: Abstracted storage adapter interface (`StorageService`: Local disk development fallback / S3 / R2 compatible) with validation (real MIME, 5MB limit, EXIF stripping).
- **Economy Enforcement**: Pure in-game currency only. Zero fiat/crypto/gift-card processing. Automated moderation scanner for RMT (Real Money Trading) terms.

### 1.2 Folder Structure Blueprint
```
/
├── app/
│   ├── layout.tsx                # Root layout with font imports, theme providers, meta tags
│   ├── globals.css               # Design tokens, theme variables, Tailwind imports
│   ├── page.tsx                  # Home hub (3-zone nav, hero showcase, live tickers)
│   ├── map-art/
│   │   ├── page.tsx              # Map Art gallery (grid, dimension filter, commission offers)
│   │   └── [id]/page.tsx         # Map Art detail & purchase/commission request
│   ├── market/
│   │   ├── page.tsx              # Buy/Sell board (dense table, live search, categories)
│   │   └── [id]/page.tsx         # Trade listing detail & deal request
│   ├── build/
│   │   ├── page.tsx              # Builder services & client request board
│   │   └── [id]/page.tsx         # Service/Request detail & quote submission
│   ├── orders/
│   │   ├── page.tsx              # User dashboard (Buyer/Seller orders filterable by status)
│   │   └── [id]/page.tsx         # Order timeline, message thread, payment confirmation, vouch trigger
│   ├── create/
│   │   └── [section]/page.tsx    # Multi-step creation form for map-art, market, build
│   ├── u/
│   │   └── [username]/page.tsx   # Player profile: IGN, vouch count, completed deals, active listings
│   ├── settings/page.tsx         # Profile settings (IGN, bio, Discord link, notifications)
│   ├── mod/
│   │   └── queue/page.tsx        # Moderation review queue for flagged vouches/listings
│   ├── admin/page.tsx            # Category management, bans, audit logs
│   └── api/
│       ├── listings/route.ts     # Listing query & mutation endpoints
│       ├── orders/route.ts       # Order lifecycle transitions (state machine)
│       ├── vouches/route.ts      # Vouch submissions & moderation check
│       └── upload/route.ts       # Secure image upload handler
├── components/
│   ├── navigation/               # TopBar, Footer, UserMenu, Breadcrumbs
│   ├── ui/                       # Accessible buttons, inputs, dialogs, tabs (custom styled)
│   ├── markdown/                 # MarkdownEditor (Write/Preview) & MarkdownRenderer
│   ├── listings/                 # MapArtCard, MarketTableRow, BuildServiceCard, FilterBar
│   ├── orders/                   # OrderTimeline, OrderChat, PaymentConfirmationModal
│   ├── vouches/                  # VouchCard, VouchModal, ReputationBadge
│   └── mod/                      # ModerationQueueItem, AuditLogRow
├── lib/
│   ├── db/prisma.ts              # Prisma client singleton
│   ├── orders/state-machine.ts   # Pure, unit-tested order transition state machine
│   ├── moderation/               # Auto-bot rules (slurs, RMT terms, spam, invite links)
│   ├── markdown/sanitize.ts      # rehype-sanitize schema & XSS protection
│   ├── currency.ts               # BigInt shorthand helpers (parseCurrency, formatCurrency: 250k, 1.5m, 2b)
│   └── storage/                  # Storage adapter (Local / Cloudflare R2 / S3)
├── prisma/
│   ├── schema.prisma             # Full Prisma schema with enums, models, indexes
│   └── seed.ts                   # Demo users, map art, market listings, orders, vouches
└── tests/
    ├── order-state-machine.test.ts
    ├── moderation-bot.test.ts
    └── markdown-sanitizer.test.ts
```

---

## 2. Prisma Schema Outline

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  MOD
  ADMIN
}

enum Section {
  MAP_ART
  MARKET
  BUILD
}

enum ListingKind {
  // Map Art
  ARTWORK
  COMMISSION_OFFER
  // Market
  SELL
  BUY
  // Build
  SERVICE
  REQUEST
}

enum OrderType {
  MAP_ART
  TRADE
  BUILD
}

enum OrderStatus {
  REQUESTED
  ACCEPTED
  IN_PROGRESS
  DELIVERED
  COMPLETED
  CANCELLED
  DISPUTED
}

enum VouchRating {
  POSITIVE
  NEGATIVE
}

enum ModerationStatus {
  APPROVED
  NEEDS_REVIEW
  REJECTED
}

enum ReportTargetType {
  LISTING
  ORDER_MESSAGE
  VOUCH
  USER
}

model User {
  id            String    @id @default(cuid())
  discordId     String?   @unique
  name          String?   // Display name
  email         String?   @unique
  image         String?
  minecraftIgn  String    @unique // In-game username (verified)
  bio           String?   @db.VarChar(500)
  role          Role      @default(USER)
  isBanned      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  listings        Listing[]
  quotesGiven     Quote[]
  ordersAsBuyer   Order[]         @relation("BuyerOrders")
  ordersAsSeller  Order[]         @relation("SellerOrders")
  vouchesGiven    Vouch[]         @relation("VouchesGiven")
  vouchesReceived Vouch[]         @relation("VouchesReceived")
  reportsFiled    Report[]        @relation("ReportsFiled")
  auditLogs       AuditLog[]
  messagesSent    OrderMessage[]
}

model Listing {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  section     Section
  kind        ListingKind
  title       String           @db.VarChar(120)
  description String           @db.VarChar(5000) // Markdown
  price       BigInt?          // Smallest in-game currency unit; null = quote-only
  isNegotiable Boolean         @default(false)
  isFulfilled Boolean          @default(false)
  isPaused    Boolean          @default(false)
  details     Json             // Section-specific metadata validated with Zod
  modStatus   ModerationStatus @default(APPROVED)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  images      ListingImage[]
  quotes      Quote[]
  orders      Order[]

  @@index([section, kind])
  @@index([userId])
  @@index([createdAt])
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  order     Int      @default(0)
  createdAt DateTime @default(now())

  @@index([listingId])
}

model Quote {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  builderId   String
  builder     User     @relation(fields: [builderId], references: [id], onDelete: Cascade)
  price       BigInt
  etaDays     Int
  message     String   @db.VarChar(1000)
  isAccepted  Boolean  @default(false)
  createdAt   DateTime @default(now())

  orders      Order[]

  @@index([listingId])
  @@index([builderId])
}

model Order {
  id              String       @id @default(cuid())
  orderNumber     Int          @unique @default(autoincrement())
  type            OrderType
  status          OrderStatus  @default(REQUESTED)
  buyerId         String
  buyer           User         @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId        String
  seller          User         @relation("SellerOrders", fields: [sellerId], references: [id])
  listingId       String?
  listing         Listing?     @relation(fields: [listingId], references: [id], onDelete: SetNull)
  quoteId         String?
  quote           Quote?       @relation(fields: [quoteId], references: [id], onDelete: SetNull)

  // Snapshotted agreed terms
  agreedPrice     BigInt
  agreedQuantity  Int          @default(1)
  itemOrService   String       @db.VarChar(150)

  // In-game payment confirmations
  buyerPaidInGame Boolean      @default(false)
  sellerReceivedInGame Boolean  @default(false)

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  events          OrderEvent[]
  messages        OrderMessage[]
  vouches         Vouch[]

  @@index([buyerId])
  @@index([sellerId])
  @@index([status])
}

model OrderEvent {
  id        String      @id @default(cuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  actorId   String
  status    OrderStatus
  note      String?     @db.VarChar(500)
  createdAt DateTime    @default(now())

  @@index([orderId])
}

model OrderMessage {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  content   String   @db.VarChar(1000) // Markdown
  createdAt DateTime @default(now())

  @@index([orderId])
}

model Vouch {
  id          String           @id @default(cuid())
  orderId     String
  order       Order            @relation(fields: [orderId], references: [id], onDelete: Cascade)
  authorId    String
  author      User             @relation("VouchesGiven", fields: [authorId], references: [id])
  targetId    String
  target      User             @relation("VouchesReceived", fields: [targetId], references: [id])
  rating      VouchRating
  content     String           @db.VarChar(1500) // Markdown
  modStatus   ModerationStatus @default(NEEDS_REVIEW)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  images      VouchImage[]

  @@unique([orderId, authorId])
  @@index([targetId, modStatus])
  @@index([authorId])
}

model VouchImage {
  id        String   @id @default(cuid())
  vouchId   String
  vouch     Vouch    @relation(fields: [vouchId], references: [id], onDelete: Cascade)
  url       String
  order     Int      @default(0)

  @@index([vouchId])
}

model Report {
  id          String           @id @default(cuid())
  reporterId  String
  reporter    User             @relation("ReportsFiled", fields: [reporterId], references: [id])
  targetType  ReportTargetType
  targetId    String
  reason      String           @db.VarChar(500)
  status      ModerationStatus @default(NEEDS_REVIEW)
  createdAt   DateTime         @default(now())

  @@index([targetType, targetId])
  @@index([status])
}

model AuditLog {
  id          String   @id @default(cuid())
  actorId     String
  actor       User     @relation(fields: [actorId], references: [id])
  action      String   @db.VarChar(100)
  targetType  String   @db.VarChar(50)
  targetId    String   @db.VarChar(100)
  details     Json?
  createdAt   DateTime @default(now())

  @@index([actorId])
  @@index([targetType, targetId])
}
```

---

## 3. Design Plan & System Specifications

### 3.1 Color Palette (6 Named Hex Values)
Grounded in Donut SMP's core materials (Obsidian void, netherite bedrock, and warm glazed honey amber):

1. **Obsidian Canvas (`--canvas`)**: `#0E1117`  
   The primary neutral backdrop. Deep, void-tinted slate (60% color distribution). Eliminates harsh pure black while honoring dark mode gaming culture.
2. **Bedrock Surface (`--surface`)**: `#161B22`  
   Structural cards and listing panels (30% structural distribution). 7% delta from canvas for subtle, restrained depth.
3. **Surface Elevate (`--surface-elevate`)**: `#1F2633`  
   Row hovers, segmented control backgrounds, and active state pill replacements.
4. **Netherite Border (`--border`)**: `#27303E`  
   Crisp 1px hairline dividers and bounding boxes. No blurry box shadows.
5. **Glazed Amber (`--accent`)**: `#E5A93C`  
   High-intent 10% accent. Reserved strictly for primary action buttons, focused input rings, and active navigation indicators. Distinctive honey glaze aesthetic matching the Donut identity.
6. **Bone Primary (`--text-primary`)**: `#F0F6FC`  
   High-contrast, clean off-white for crisp headline and body legibility (WCAG AAA compliant against `#0E1117`).
7. **Parchment Muted (`--text-muted`)**: `#8B949E`  
   Subtle metadata, tags, and timestamps. Never wrapped in heavy pills.
8. **Functional Status Semantics** (always paired with icon or text, never hue-only):
   - Positive Vouch / Completed: `#3FB950`
   - Negative Vouch / Disputed: `#F85149`
   - Pending / In Progress: `#DB6D28`

### 3.2 Typography & Scale
- **Display & Heading**: `Plus Jakarta Sans` (Geometric, clean architectural sans). Weights: SemiBold (600), Bold (700).
- **Body Prose**: `Plus Jakarta Sans` (400 Regular, 500 Medium) with 1.6 line height and max-width 72ch for optimal reading comfort.
- **Tabular & Telemetry Outlier**: `JetBrains Mono` / `ui-monospace`. Strictly for in-game currency numbers (`250k`, `1.5M $`), map dimensions (`1×1`, `2×2`), order numbers (`#1042`), and Minecraft IGN handles.
- **Scale**:
  - `Hero Display`: `clamp(2rem, 3.5vw, 3rem)` — font-bold, tracking-tight, `text-wrap: balance`
  - `Section Header`: `1.375rem` (22px) — font-semibold, tracking-tight
  - `Card / Row Title`: `1rem` (16px) — font-medium
  - `Body`: `0.9375rem` (15px) — line-height 1.6
  - `Unboxed Metadata`: `0.75rem` (12px) — tracking-wide text-muted with `·` separators
  - `Currency / Data Tag`: `0.875rem` (14px) — font-mono tabular-nums font-semibold

### 3.3 Layout Concept per Section
1. **Home (`/`)**:
   - One-row 3-zone Top Bar contract: Brand Wordmark $\to$ 4 section links (`Map Art`, `Buy/Sell`, `Build`, `Orders`) $\to$ Primary action button (`Post Listing`).
   - Restrained hero focal point introducing Donut SMP's verified trade network with real community trust metrics.
   - Dual preview modules: Curated Map Art gallery spotlight side-by-side with high-velocity live trading ticker.
2. **Map Art (`/map-art`)**:
   - Visual-first grid of square frames (1:1 ratio matching Minecraft item frames). Quiet netherite borders with unboxed artist name, dimensions (`2×2`), and price in glazed amber.
   - Segmented interactive dimension filter (`All`, `1×1`, `2×2`, `3×3`, `Custom`, `Commissions`).
3. **Buy/Sell (`/market`)**:
   - High-density trading board. Dense, scannable tabular rows showing Item Name, Category, Stock Quantity, Unit/Total Price, Seller IGN + Vouch Score, and 1-click `Request Order`.
   - Real-time search with category chips.
4. **Build (`/build`)**:
   - Split tab between **Builder Services** (portfolio showcase with turnaround time) and **Client Requests** (detailed brief, budget range, deadline, and `Send Quote` modal).
5. **Orders (`/orders/[id]`)**:
   - Clean linear state timeline (`REQUESTED → ACCEPTED → IN_PROGRESS → DELIVERED → COMPLETED`).
   - Side-by-side deal details and encrypted Markdown order messaging thread.
   - In-game payment confirmation toggles for both buyer and seller.
   - Direct vouch creation unlock upon `COMPLETED` status.
6. **Profiles & Vouches (`/u/[username]`)**:
   - NameMC-inspired clean player identity: IGN, member tenure, completed deal count, positive/negative vouch ratio, and chronological proof gallery.

---

## 4. ASCII Wireframes & Alignment Guides

### 4.1 Home Page Wireframe (`/`)
```
+------------------------------------------------------------------------------------+
| [DONUT SMP MARKET]            Map Art    Buy/Sell    Build    Orders   [Post Listing] |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  DONUT SMP ECONOMY HUB                                                             |
|  Verified Map Art, Item Trading & Build Services                                   |
|  In-game currency only · 1,420 Completed Deals · 99.4% Verified Vouch Rate        |
|                                                                                    |
|  [Explore Map Art]   [Browse Trading Board]   [Hire a Builder]                     |
|                                                                                    |
+------------------------------------------------------------------------------------+
| FEATURED MAP ART (1:1 Frames)             | LIVE TRADING BOARD (High Density)      |
| +-------------+  +-------------+          | ITEM         QTY   PRICE    SELLER     |
| |             |  |             |          | Spawner:Pig  x4    1.2M $   Viper [98+]|
| |   [Image]   |  |   [Image]   |          | Elytra Max   x1    850K $   Krono [44+]|
| |             |  |             |          | Shulker Box  x16   320K $   Axel  [12+]|
| +-------------+  +-------------+          | Netherite Ingx64   4.5M $   Byte  [67+]|
| Sunset Over Void  Cyber Knight            | Totem x32    x32   600K $   Rift  [31+]|
| 2x2 · 850k $      3x3 · 1.5m $            | [View All Market Listings ->]          |
+------------------------------------------------------------------------------------+
| VERIFIED ORDER & REPUTATION ENGINE                                                 |
| 1. Request Deal -> 2. In-Game Delivery -> 3. Confirm Both -> 4. Post Vouch        |
+------------------------------------------------------------------------------------+
| (c) Donut SMP Community Marketplace · Unofficial player tool · In-Game Currency   |
+------------------------------------------------------------------------------------+
```

### 4.2 Listing Page Wireframe (`/map-art/[id]` or `/market/[id]`)
```
+------------------------------------------------------------------------------------+
| [DONUT SMP MARKET]            Map Art    Buy/Sell    Build    Orders   [Post Listing] |
+------------------------------------------------------------------------------------+
| < Back to Map Art                                                                  |
|                                                                                    |
| +-----------------------------------+  +-----------------------------------------+ |
| |                                   |  | Sunset Over Obsidian                     | |
| |                                   |  | By CraftMaster (IGN: CraftMaster_01)     | |
| |                                   |  | 98 Positive Vouches · 0 Negative         | |
| |         HIGH-RES MAP ART          |  | 142 Completed Orders · Member since 2025| |
| |            (1:1 Frame)            |  +-----------------------------------------+ |
| |                                   |  | PRICE: 850,000 $ (In-Game Currency)     | |
| |                                   |  | SIZE:  2x2 (4 item frames)              | |
| |                                   |  | STOCK: 3 Copies Ready in Vault          | |
| +-----------------------------------+  +-----------------------------------------+ |
| | [Thumb 1]  [Thumb 2]  [In-Game Proof] | | [Request Order via In-Game Trade]     | |
| +-----------------------------------+  | [Send Message to Artist]                | |
|                                        +-----------------------------------------+ |
| DESCRIPTION (Markdown):                | VERIFIED ARTIST VOUCHES (Last 3):        | |
| Built on Donut SMP Season 5.           | [+] "Fast delivery, dropped safe at /spawn| |
| Verified original staircase art.       |     Smooth trade!" — Player_Nine         | |
| Delivered in shulker box at spawn.     | [+] "Map frames align perfectly."        | |
+------------------------------------------------------------------------------------+
```

---

## 5. Review against Section 12.2 Anti-Slop Bans

1. **Surfaces & Color**:
   - **Cliché Avoided**: No SaaS card kit with 24px rounded corners and diffuse colored shadows.
   - **Specific Choice**: Crisp hairline borders (`1px solid #27303E`) over deep `#161B22` surface panels. No purple or blue gradients. No glassmorphism.
2. **Typography**:
   - **Cliché Avoided**: No default Inter or system-ui font soup; no multi-color split headlines; no mechanical `// 01_SECTION` prefixes.
   - **Specific Choice**: Clean `Plus Jakarta Sans` with natural title-case editorial headers and `JetBrains Mono` strictly for tabular prices and coordinates.
3. **Pills & Badges**:
   - **Cliché Avoided**: No colored badge sandwiches or pill capsules over card images.
   - **Specific Choice**: Clean unboxed metadata separated by quiet `·` typography.
4. **Icons & Controls**:
   - **Cliché Avoided**: No emojis as icons. No decorative pulsing green dots or fake background telemetry tickers.
   - **Specific Choice**: Crisp SVG icons from `lucide-react` paired directly with explicit text labels.
5. **Copy & Tone**:
   - **Cliché Avoided**: No buzzwords like "Elevate your Minecraft experience" or "Unlock seamless trading".
   - **Specific Choice**: Plain, player-native vocabulary: `WTS`, `WTB`, `IGN`, `Map Art`, `Vouch`, `In-Game Delivery`.

---

## 6. Implementation as Design Tokens

These design tokens are declared in `app/globals.css`:
- `--canvas: #0E1117`
- `--surface: #161B22`
- `--surface-elevate: #1F2633`
- `--border: #27303E`
- `--accent: #E5A93C`
- `--accent-hover: #D4982F`
- `--text-primary: #F0F6FC`
- `--text-muted: #8B949E`
- `--status-positive: #3FB950`
- `--status-negative: #F85149`
- `--status-pending: #DB6D28`

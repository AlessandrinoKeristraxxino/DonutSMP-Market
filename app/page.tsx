'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Package,
  Wrench,
  Palette,
  ExternalLink,
  Plus,
  ChevronRight,
  ThumbsUp,
} from 'lucide-react';
import { useListings } from '@/lib/data/ListingsContext';
import { formatCurrency, formatCurrencyFull } from '@/lib/currency';
import { TopBar } from '@/components/navigation/TopBar';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { DEMO_ORDERS, DEMO_VOUCHES } from '@/lib/data/mock-db';

export default function HomePage() {
  const { listings, currentUser } = useListings();
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'SELL' | 'BUY'>('ALL');

  // Featured Map Art items (up to 4)
  const featuredMapArt = listings
    .filter((l) => l.section === 'MAP_ART')
    .slice(0, 4);

  // Live Market Trading Board items (up to 5)
  const liveMarketRows = listings
    .filter((l) => l.section === 'MARKET')
    .filter((l) => marketFilter === 'ALL' || l.kind === marketFilter)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-12">
        {/* 1. HERO SECTION */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 rounded-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Donut SMP Verified Network</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Currency Only</span>
              <span aria-hidden="true">·</span>
              <span>Tracked Order State Machine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] text-balance">
              The verified marketplace for Donut SMP map artists, traders & builders.
            </h1>

            <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Trade spawners, commission custom map art, and contract top builders with guaranteed
              reputation tracking. Zero real money allowed — every deal is settled in-game and locked with verified vouches.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/map-art"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm"
              >
                <span>Explore Map Art</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/market"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--surface-elevate)] hover:bg-[var(--border)] transition-colors rounded-md border border-[var(--border)]"
              >
                <span>Browse Trading Board</span>
              </Link>
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 ml-auto sm:ml-0">
                <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
                <span>Active IGN: <strong className="text-[var(--text-primary)] font-mono">{currentUser.minecraftIgn}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THREE SECTION GATEWAYS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Three Core Marketplace Sections
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              Built for Donut SMP gameplay dynamics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Map Art Gateway */}
            <Link
              href="/map-art"
              className="group border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-4 hover:border-[var(--accent)]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[var(--surface-elevate)] rounded text-[var(--accent)]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">1×1 to 4×4</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-base group-hover:text-[var(--accent)] transition-colors">
                  Map Art Gallery & Commissions
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                  Finished rendered canvases and custom commission offers with slot tracking and staircase shading.
                </p>
              </div>
              <div className="text-xs text-[var(--accent)] flex items-center gap-1 pt-2 border-t border-[var(--border)] font-medium">
                <span>View Gallery & Artists</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Buy / Sell Gateway */}
            <Link
              href="/market"
              className="group border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-4 hover:border-[var(--accent)]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[var(--surface-elevate)] rounded text-[var(--accent)]">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">High Density</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-base group-hover:text-[var(--accent)] transition-colors">
                  Buy & Sell Item Board
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                  High-velocity trading of spawners, enchanted gear, netherite ingots, and rare combat bundles.
                </p>
              </div>
              <div className="text-xs text-[var(--accent)] flex items-center gap-1 pt-2 border-t border-[var(--border)] font-medium">
                <span>Open Trading Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Build Services Gateway */}
            <Link
              href="/build"
              className="group border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-4 hover:border-[var(--accent)]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-[var(--surface-elevate)] rounded text-[var(--accent)]">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">Quote-Based</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-base group-hover:text-[var(--accent)] transition-colors">
                  Build Services & Client Briefs
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
                  Hire builders for megabases, redstone perimeters, and mob farms. Send formal quotes on client briefs.
                </p>
              </div>
              <div className="text-xs text-[var(--accent)] flex items-center gap-1 pt-2 border-t border-[var(--border)] font-medium">
                <span>Browse Contractors & Briefs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </section>

        {/* 3. SPLIT PREVIEW: MAP ART FEATURED + HIGH-DENSITY MARKET TICKER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Map Art Spotlight (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                Featured Map Art (1:1 Frames)
              </h2>
              <Link href="/map-art" className="text-xs text-[var(--accent)] hover:underline font-medium">
                View all ({listings.filter((l) => l.section === 'MAP_ART').length}) →
              </Link>
            </div>

            <div className="space-y-3">
              {featuredMapArt.map((art) => (
                <Link
                  key={art.id}
                  href={`/map-art/${art.id}`}
                  className="group border border-[var(--border)] bg-[var(--surface)] p-3.5 rounded-lg flex items-center gap-3.5 hover:border-[var(--accent)]/60 transition-colors"
                >
                  <div className="w-16 h-16 shrink-0 rounded bg-[#090C10] border border-[var(--border)] overflow-hidden">
                    <img
                      src={art.images[0] || 'https://picsum.photos/seed/mapart/800/800'}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>Size: {art.details?.mapSize || '1×1'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#3FB950]">+87 vouches</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-[var(--accent)] tabular-numbers pt-0.5">
                      {formatCurrency(art.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* High-Density Live Trading Board (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                  Live Trading Board
                </h2>
                <div className="flex items-center gap-1 bg-[var(--surface-elevate)] p-0.5 rounded text-xs">
                  {(['ALL', 'SELL', 'BUY'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMarketFilter(filter)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        marketFilter === filter
                          ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {filter === 'ALL' ? 'All' : filter === 'SELL' ? 'WTS' : 'WTB'}
                    </button>
                  ))}
                </div>
              </div>
              <Link href="/market" className="text-xs text-[var(--accent)] hover:underline font-medium">
                Open Full Board →
              </Link>
            </div>

            <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-elevate)] text-[var(--text-muted)] font-medium">
                    <th className="py-2.5 px-4">Item & Category</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-4 text-right">Total Price</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {liveMarketRows.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--surface-elevate)]/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/market/${item.id}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors block truncate max-w-[220px]"
                        >
                          {item.title}
                        </Link>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          <span>{item.details?.category || 'Misc'}</span>
                          <span className="mx-1">·</span>
                          <span
                            className={`font-mono ${
                              item.kind === 'SELL' ? 'text-[var(--accent)]' : 'text-[#3FB950]'
                            }`}
                          >
                            {item.kind === 'SELL' ? 'WTS' : 'WTB'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[var(--text-primary)] tabular-numbers">
                        x{item.details?.quantity || 1}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[var(--accent)] tabular-numbers">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/market/${item.id}`}
                          className="px-2.5 py-1 bg-[var(--surface-elevate)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded text-[11px] transition-colors"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. VERIFIED ORDER PIPELINE & AUDITED VOUCH */}
        <section className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-4">
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-[var(--text-primary)]">
                Tracked Order Reputation Model (Order #1041)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Every deal is snapshotted to preserve terms and locks vouches until in-game delivery is confirmed.
              </p>
            </div>
            <span className="text-xs font-mono text-[#3FB950] bg-[#3FB950]/10 px-2.5 py-1 rounded border border-[#3FB950]/30">
              STATUS: COMPLETED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-[var(--surface-elevate)] rounded space-y-2 text-xs">
              <div className="font-semibold text-[var(--text-primary)]">Snapshotted Deal Terms:</div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Item:</span>
                <span className="text-[var(--text-primary)] font-mono">Sunset over Obsidian Spire (2×2)</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Agreed Price:</span>
                <span className="text-[var(--accent)] font-mono font-bold">850,000 $</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>In-Game Payment:</span>
                <span className="text-[#3FB950] font-mono">Confirmed by both buyer & seller</span>
              </div>
            </div>

            <div className="p-4 bg-[var(--surface-elevate)] rounded space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">
                  Verified Vouch from{' '}
                  <Link href="/u/Zephyr_Builds" className="text-[var(--accent)] hover:underline font-mono">
                    @Zephyr_Builds
                  </Link>
                  :
                </span>
                <span className="text-[11px] font-mono text-[#3FB950] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> +1 POSITIVE
                </span>
              </div>
              <div className="text-xs text-[var(--text-primary)]">
                <MarkdownRenderer content={DEMO_VOUCHES[0].content} />
              </div>
              <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[11px] font-mono text-[var(--text-muted)]">
                <Link href="/orders/ord-1041" className="hover:text-[var(--text-primary)] flex items-center gap-1">
                  <span>View Tracked Order #1041</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link href="/u/Prism_Art" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                  <span>View Prism_Art&apos;s Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--canvas)] px-6 py-6 mt-12 text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Donut SMP Marketplace</span>
            <span aria-hidden="true">·</span>
            <span>Strictly In-Game Currency</span>
            <span aria-hidden="true">·</span>
            <span>Community Trade & Vouch Tool</span>
          </div>
          <div className="text-xs font-mono text-amber-300">
            Phase 5 Active · Build Services, Quote Engine & Admin Controls
          </div>
        </div>
      </footer>
    </div>
  );
}

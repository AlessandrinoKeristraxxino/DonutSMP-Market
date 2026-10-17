'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { formatCurrency, formatCurrencyFull } from '@/lib/currency';
import {
  Search,
  Plus,
  ArrowUpDown,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Pause,
  CheckCircle,
} from 'lucide-react';

export default function MarketBoardPage() {
  const { listings, currentUser } = useListings();

  const [kindFilter, setKindFilter] = useState<'ALL' | 'SELL' | 'BUY'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>('NEWEST');

  const marketListings = useMemo(() => {
    return listings
      .filter((l) => l.section === 'MARKET')
      .filter((l) => kindFilter === 'ALL' || l.kind === kindFilter)
      .filter((l) => categoryFilter === 'ALL' || l.details?.category === categoryFilter)
      .filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.details?.category?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') {
          return Number((a.price || 0n) - (b.price || 0n));
        }
        if (sortBy === 'PRICE_DESC') {
          return Number((b.price || 0n) - (a.price || 0n));
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, kindFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Market Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Section: Buy / Sell Trading Board</span>
              <span aria-hidden="true">·</span>
              <span>Spawners, Gear, Resources</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Currency Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Donut SMP Item Trading Board
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              High-velocity classified listings for grinders and traders. Live WTS (Want to Sell) and WTB (Want to Buy) with verified seller reputation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create/market"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Trade Listing</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
          {/* Kind Filter (WTS vs WTB) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] mr-1 font-medium">Type:</span>
            {[
              { id: 'ALL', label: 'All Trades' },
              { id: 'SELL', label: 'WTS (Selling)' },
              { id: 'BUY', label: 'WTB (Buying)' },
            ].map((k) => (
              <button
                key={k.id}
                onClick={() => setKindFilter(k.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  kindFilter === k.id
                    ? 'bg-[var(--accent)] text-black font-semibold'
                    : 'bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] mr-1 font-medium">Category:</span>
            {['ALL', 'Spawners', 'Gear', 'Resources', 'Misc'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[var(--surface-elevate)] text-[var(--text-primary)] border border-[var(--border)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spawner, elytra..."
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface-elevate)] border border-[var(--border)] focus:border-[var(--accent)] rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--surface-elevate)] px-2.5 py-1.5 rounded border border-[var(--border)] text-xs text-[var(--text-muted)]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="NEWEST" className="bg-[#161B22] text-white">Newest First</option>
                <option value="PRICE_ASC" className="bg-[#161B22] text-white">Price: Low to High</option>
                <option value="PRICE_DESC" className="bg-[#161B22] text-white">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* High Density Trading Table */}
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden">
          {marketListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[var(--border)]">
                <thead>
                  <tr className="bg-[var(--surface-elevate)] text-[var(--text-muted)] font-medium">
                    <th className="py-3 px-4">Item & Category</th>
                    <th className="py-3 px-3">Trade Kind</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                    <th className="py-3 px-4">Seller / Buyer</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {marketListings.map((item) => {
                    const isSelling = item.kind === 'SELL';
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[var(--surface-elevate)]/60 transition-colors ${
                          item.isPaused ? 'opacity-60 bg-black/20' : ''
                        }`}
                      >
                        {/* Title & Category */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/market/${item.id}`}
                            className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors block truncate max-w-xs"
                          >
                            {item.title}
                          </Link>
                          {/* Unboxed Metadata with Typographic Separator */}
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-0.5">
                            <span>{item.details?.category || 'Misc'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.isNegotiable ? 'Negotiable' : 'Firm Price'}</span>
                            {item.isPaused && <span className="text-[#DB6D28]">· Paused</span>}
                            {item.isFulfilled && <span className="text-[#3FB950]">· Fulfilled</span>}
                          </div>
                        </td>

                        {/* Trade Kind */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              isSelling ? 'text-[var(--accent)]' : 'text-[#3FB950]'
                            }`}
                          >
                            {isSelling ? 'WTS' : 'WTB'}
                          </span>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-3 text-right font-mono text-[var(--text-primary)] tabular-numbers">
                          x{item.details?.quantity || 1}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-bold text-sm text-[var(--accent)] tabular-numbers">
                            {formatCurrency(item.price)}
                          </div>
                          {item.details?.unitPrice && (
                            <div className="text-[10px] text-[var(--text-muted)] font-mono tabular-numbers">
                              {formatCurrency(item.details.unitPrice)}/ea
                            </div>
                          )}
                        </td>

                        {/* Seller IGN */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-medium text-[var(--text-primary)]">
                            VoidMiner_X
                          </div>
                          <div className="text-[11px] text-[#3FB950] font-mono">
                            +94 vouches · 112 deals
                          </div>
                        </td>

                        {/* Action Link */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/market/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--surface-elevate)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded text-xs transition-colors font-medium"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Package className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">No market trades found</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Try broadening your category filter or search terms.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { formatCurrency } from '@/lib/currency';
import { Search, Plus, Filter, ArrowUpDown, Layers, Palette } from 'lucide-react';

export default function MapArtGalleryPage() {
  const { listings, currentUser } = useListings();

  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [kindFilter, setKindFilter] = useState<'ALL' | 'ARTWORK' | 'COMMISSION_OFFER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'TOP_VOUCHED'>('NEWEST');

  // Filter map-art listings
  const mapArtListings = useMemo(() => {
    return listings
      .filter((item) => item.section === 'MAP_ART')
      .filter((item) => kindFilter === 'ALL' || item.kind === kindFilter)
      .filter((item) => sizeFilter === 'ALL' || item.details?.mapSize === sizeFilter)
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.details?.tags?.some((t: string) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') {
          return Number((a.price || 0n) - (b.price || 0n));
        }
        if (sortBy === 'PRICE_DESC') {
          return Number((b.price || 0n) - (a.price || 0n));
        }
        if (sortBy === 'TOP_VOUCHED') {
          return 0; // Handled per author vouch rating
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, sizeFilter, kindFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Gallery Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Section: Map Art</span>
              <span aria-hidden="true">·</span>
              <span>1:1 Frame Standard</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Currency Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Map Art Gallery & Commissions
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Original hand-built map art rendered on Donut SMP. Purchase finished canvas frames or hire artists for custom commissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create/map-art"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Post Map Art</span>
            </Link>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
          {/* Size Filter Buttons (Segmented Controls) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] mr-2 font-medium">Size:</span>
            {['ALL', '1×1', '2×2', '3×3', 'Custom'].map((sz) => (
              <button
                key={sz}
                onClick={() => setSizeFilter(sz)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  sizeFilter === sz
                    ? 'bg-[var(--accent)] text-black font-semibold'
                    : 'bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Kind Filter (Artwork vs Commissions) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] mr-2 font-medium">Type:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ARTWORK', label: 'Finished Art' },
              { id: 'COMMISSION_OFFER', label: 'Commissions' },
            ].map((k) => (
              <button
                key={k.id}
                onClick={() => setKindFilter(k.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  kindFilter === k.id
                    ? 'bg-[var(--surface-elevate)] text-[var(--text-primary)] border border-[var(--border)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {k.label}
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
                placeholder="Search title, tag..."
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

        {/* Map Art Cards Grid (1:1 Frame Format) */}
        {mapArtListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mapArtListings.map((item) => {
              const isCommission = item.kind === 'COMMISSION_OFFER';
              return (
                <Link
                  key={item.id}
                  href={`/map-art/${item.id}`}
                  className="group border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden flex flex-col hover:border-[var(--accent)]/60 transition-all"
                >
                  {/* Square 1:1 Map Frame Canvas */}
                  <div className="aspect-square w-full bg-[#090C10] relative overflow-hidden flex items-center justify-center p-3 border-b border-[var(--border)]">
                    <img
                      src={item.images[0] || 'https://picsum.photos/seed/mapart/800/800'}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded shadow-inner group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Subtle Dimension & Kind Watermark */}
                    <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-medium text-stone-200 border border-white/10">
                      {item.details?.mapSize || '1×1'}
                    </div>

                    {isCommission && (
                      <div className="absolute top-3 right-3 bg-[var(--accent)] text-black px-2 py-0.5 rounded text-[10px] font-semibold">
                        Commission
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      {/* Unboxed Metadata with Typographic Separator */}
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                        <span>Artist: Prism_Art</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#3FB950] font-mono">+87 vouches</span>
                      </div>
                    </div>

                    {/* Tags row */}
                    {item.details?.tags && item.details.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-[var(--text-muted)]">
                        {item.details.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-stone-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Price & Stock */}
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                          {isCommission ? 'Starting' : 'Price'}
                        </div>
                        <div className="text-sm font-mono font-bold text-[var(--accent)] tabular-numbers">
                          {formatCurrency(item.price)}
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-[var(--text-muted)] text-right">
                        {isCommission ? (
                          <span>{item.details?.openSlots || 1} slots open</span>
                        ) : (
                          <span>{item.details?.copiesInStock || 1} in stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center border border-[var(--border)] rounded-lg bg-[var(--surface)] space-y-3">
            <Palette className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No Map Art listings found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              No artwork matched your current filter criteria. Try clearing search or size filters.
            </p>
            <button
              onClick={() => {
                setSizeFilter('ALL');
                setKindFilter('ALL');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 bg-[var(--surface-elevate)] text-xs text-[var(--text-primary)] hover:bg-[var(--border)] rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

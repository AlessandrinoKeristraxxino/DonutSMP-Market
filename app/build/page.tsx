'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useQuotes } from '@/lib/data/QuotesContext';
import { formatCurrency } from '@/lib/currency';
import {
  Hammer,
  FileQuestion,
  Search,
  Plus,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

export default function BuildServicesBoardPage() {
  const { listings } = useListings();
  const { quotes } = useQuotes();

  const [activeTab, setActiveTab] = useState<'SERVICES' | 'REQUESTS'>('SERVICES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>('NEWEST');

  // Filter listings for section BUILD
  const buildListings = useMemo(() => {
    return listings
      .filter((item) => item.section === 'BUILD')
      .filter((item) => {
        if (activeTab === 'SERVICES') return item.kind === 'SERVICE';
        return item.kind === 'REQUEST';
      })
      .filter((item) => {
        if (selectedTag === 'ALL') return true;
        const types = item.details?.buildTypes || [];
        return types.some((t: string) => t.toLowerCase() === selectedTag.toLowerCase());
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.details?.buildTypes?.some((t: string) => t.toLowerCase().includes(q))
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
  }, [listings, activeTab, selectedTag, searchQuery, sortBy]);

  const serviceCount = listings.filter((l) => l.section === 'BUILD' && l.kind === 'SERVICE').length;
  const requestCount = listings.filter((l) => l.section === 'BUILD' && l.kind === 'REQUEST').length;

  const tagList = ['ALL', 'Farm', 'Base', 'Redstone', 'Nether', 'Terraforming', 'Decorative'];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Section: Build Services & Contracts</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Currency Only</span>
              <span aria-hidden="true">·</span>
              <span>Escrow Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Builder Services & Client Requests
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Hire vetted Minecraft architects for megabases, industrial farms, and redstone perimeters. Post your project brief or submit binding quotes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create/build"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Post Service or Request</span>
            </Link>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Tab Switch */}
          <div className="inline-flex p-1 bg-[var(--surface-elevate)] rounded-lg border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('SERVICES')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'SERVICES'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Hammer className="w-4 h-4 text-[var(--accent)]" />
              <span>Builder Services</span>
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">
                {serviceCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'REQUESTS'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileQuestion className="w-4 h-4 text-emerald-400" />
              <span>Client Requests</span>
              <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--text-muted)]">
                {requestCount}
              </span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder={activeTab === 'SERVICES' ? 'Search services, farms, redstone...' : 'Search client requests, base briefs...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--text-muted)] shrink-0 mr-1">Category:</span>
          {tagList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded border text-xs font-medium transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-stone-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Listing Grid */}
        {buildListings.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8">
            <Hammer className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No build listings found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              {searchQuery || selectedTag !== 'ALL'
                ? 'Try adjusting your search filters or category selections.'
                : activeTab === 'SERVICES'
                ? 'Be the first contractor to offer architectural services on Donut SMP.'
                : 'No client requests yet. Post a brief to hire a builder.'}
            </p>
            <Link
              href="/create/build"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post {activeTab === 'SERVICES' ? 'Build Service' : 'Client Request'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildListings.map((item) => {
              const types = item.details?.buildTypes || ['Base'];
              const turnaround = item.details?.turnaroundDays;
              const deadline = item.details?.deadline;
              const listingQuotes = quotes.filter((q) => q.listingId === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-[var(--surface)] border border-[var(--border)] hover:border-stone-600 transition-colors rounded-lg overflow-hidden flex flex-col group shadow-sm"
                >
                  {/* Visual Preview */}
                  <Link href={`/build/${item.id}`} className="block relative aspect-video bg-black/40 overflow-hidden">
                    <Image
                      src={item.images[0] || 'https://picsum.photos/seed/build/800/800'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider ${
                        item.kind === 'SERVICE'
                          ? 'bg-amber-500/90 text-black'
                          : 'bg-emerald-500/90 text-black'
                      }`}>
                        {item.kind === 'SERVICE' ? 'Builder Service' : 'Client Request'}
                      </span>
                    </div>

                    {turnaround && (
                      <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-stone-300 flex items-center gap-1 border border-stone-800">
                        <Clock className="w-3 h-3 text-[var(--accent)]" />
                        <span>{turnaround}d turnaround</span>
                      </div>
                    )}
                    {deadline && (
                      <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-stone-300 flex items-center gap-1 border border-stone-800">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>Deadline: {deadline}</span>
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {types.map((t: string) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevate)] text-[var(--text-muted)] border border-[var(--border)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <Link href={`/build/${item.id}`} className="block">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {item.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {item.description.replace(/[#*`]/g, '')}
                      </p>
                    </div>

                    {/* Price and Footer Metadata */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {item.kind === 'SERVICE' ? 'Base Pricing' : 'Max Budget'}
                        </div>
                        <div className="text-sm font-mono font-semibold text-amber-300">
                          {item.price ? formatCurrency(item.price) : 'Quote-Based'}
                        </div>
                      </div>

                      {item.kind === 'REQUEST' ? (
                        <div className="text-right">
                          <div className="text-[10px] text-[var(--text-muted)]">Bids Submitted</div>
                          <div className="text-xs font-mono font-medium text-emerald-400 flex items-center justify-end gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{listingQuotes.length} Quotes</span>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={`/build/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[var(--text-primary)] hover:text-[var(--accent)] font-medium transition-colors"
                        >
                          <span>Hire Builder</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

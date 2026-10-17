'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useOrders } from '@/lib/data/OrdersContext';
import { formatCurrency, formatCurrencyFull } from '@/lib/currency';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import {
  ChevronLeft,
  ShieldCheck,
  Package,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

export default function MapArtDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { getListing, currentUser, togglePause, markFulfilled, deleteListing } = useListings();
  const { createOrder } = useOrders();

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const listing = getListing(id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-60" />
          <h2 className="text-xl font-bold">Map Art Listing Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">
            This listing may have been fulfilled or removed by its author.
          </p>
          <Link
            href="/map-art"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-black bg-[var(--accent)] rounded hover:bg-[var(--accent-hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Map Art Gallery</span>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = currentUser.id === listing.userId;
  const author = listing.author;
  const isCommission = listing.kind === 'COMMISSION_OFFER';

  const handleOrderSubmit = () => {
    const newOrder = createOrder({
      type: 'MAP_ART',
      sellerId: listing.userId,
      listingId: listing.id,
      agreedPrice: listing.price || 0n,
      agreedQuantity: 1,
      itemOrService: listing.title,
      initialMessage: `Order placed for ${listing.title} (${listing.details?.mapSize || '1x1'}). Ready to trade in-game at /spawn.`,
    });
    router.push(`/orders/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <Link
            href="/map-art"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Map Art Gallery</span>
          </Link>

          {/* Owner Management Controls */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePause(listing.id)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--surface-elevate)] border border-[var(--border)] hover:bg-[var(--border)] rounded text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {listing.isPaused ? (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 text-[#3FB950]" />
                    <span>Resume Listing</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Pause Listing</span>
                  </>
                )}
              </button>

              <button
                onClick={() => markFulfilled(listing.id)}
                className={`inline-flex items-center gap-1 px-3 py-1 border rounded text-xs transition-colors ${
                  listing.isFulfilled
                    ? 'bg-[#3FB950]/15 border-[#3FB950]/40 text-[#3FB950]'
                    : 'bg-[var(--surface-elevate)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{listing.isFulfilled ? 'Fulfilled' : 'Mark Fulfilled'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this listing permanently?')) {
                    deleteListing(listing.id);
                    router.push('/map-art');
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] hover:bg-[#F85149]/20 rounded text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Listing Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 1:1 Map Frame & Thumbnails (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-lg bg-[#090C10] border border-[var(--border)] p-4 flex items-center justify-center relative overflow-hidden">
              <img
                src={listing.images[selectedImageIdx] || listing.images[0]}
                alt={listing.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded shadow-md"
              />

              <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono text-stone-200 border border-white/10">
                {listing.details?.mapSize || '1×1'}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 shrink-0 rounded border overflow-hidden transition-all ${
                      selectedImageIdx === idx
                        ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications Card */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-4 rounded-lg space-y-2.5 text-xs">
              <div className="font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Artwork Specifications
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Map Size / Item Frames:</span>
                <span className="font-mono text-[var(--text-primary)] font-semibold">
                  {listing.details?.mapSize || '1×1'}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Stock / Copies:</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {isCommission ? `${listing.details?.openSlots || 1} slots` : `${listing.details?.copiesInStock || 1} copies in vault`}
                </span>
              </div>
              {listing.details?.turnaroundDays && (
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Turnaround Time:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {listing.details.turnaroundDays} days
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Delivery Method:</span>
                <span className="text-[var(--text-primary)]">Item Frame / Shulker Box drop at /spawn</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price, Artist Reputation & Order Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{isCommission ? 'Commission Service' : 'Finished Artwork'}</span>
                <span aria-hidden="true">·</span>
                <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                {listing.isPaused && <span className="text-[#DB6D28] font-mono">· PAUSED</span>}
                {listing.isFulfilled && <span className="text-[#3FB950] font-mono">· FULFILLED</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {listing.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                  {isCommission ? 'Starting Commission Price' : 'In-Game Price'}
                </div>
                <div className="text-3xl font-mono font-bold text-[var(--accent)] tabular-numbers">
                  {formatCurrency(listing.price)}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                  Full amount: {formatCurrencyFull(listing.price)}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setOrderModalOpen(true)}
                  disabled={listing.isPaused || listing.isFulfilled}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md shadow-sm whitespace-nowrap"
                >
                  {isCommission ? 'Request Custom Commission' : 'Request In-Game Order'}
                </button>
              </div>
            </div>

            {/* Artist Profile & Trust Signals (NameMC style) */}
            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={author.avatarUrl}
                  alt={author.minecraftIgn}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded bg-[#090C10] border border-[var(--border)] object-cover"
                />
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    {author.name} <span className="text-xs font-mono text-[var(--text-muted)]">({author.minecraftIgn})</span>
                  </div>
                  {/* Unboxed Metadata with Typographic Separator */}
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                    <span className="text-[#3FB950] font-mono">+{author.positiveVouches} positive</span>
                    <span aria-hidden="true">·</span>
                    <span>{author.completedOrders} completed deals</span>
                    <span aria-hidden="true">·</span>
                    <span>Member since {author.memberSince}</span>
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-mono text-[var(--text-muted)]">
                  Discord: {author.discordId}
                </div>
              </div>
            </div>

            {/* Description (Markdown Renderer with strict sanitization) */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
                Description & Delivery Terms
              </h3>
              <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <MarkdownRenderer content={listing.description} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Order Request Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Confirm In-Game Order Request
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Snapshotted agreement with artist <span className="font-mono text-[var(--text-primary)]">{author.minecraftIgn}</span>.
              </p>
            </div>

            <div className="space-y-2 text-xs bg-[var(--surface-elevate)] p-4 rounded border border-[var(--border)]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Item:</span>
                <span className="font-semibold text-[var(--text-primary)]">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Snapshotted Price:</span>
                <span className="font-mono font-bold text-[var(--accent)]">
                  {formatCurrency(listing.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Delivery Location:</span>
                <span className="text-[var(--text-primary)]">Donut SMP Spawn Market</span>
              </div>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed space-y-1">
              <p>
                • No real money: payment must occur strictly in-game using Donut SMP currency.
              </p>
              <p>
                • Once the artist delivers the maps in-game, you will confirm completion on the site to unlock vouch posting.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOrderSubmit}
                className="px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm"
              >
                Confirm & Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

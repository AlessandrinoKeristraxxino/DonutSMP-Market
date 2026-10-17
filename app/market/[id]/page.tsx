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
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { getListing, currentUser, togglePause, markFulfilled, deleteListing } = useListings();
  const { createOrder } = useOrders();

  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const listing = getListing(id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-60" />
          <h2 className="text-xl font-bold">Trade Listing Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">
            This item may have already been traded or removed by the seller.
          </p>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-black bg-[var(--accent)] rounded hover:bg-[var(--accent-hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Trading Board</span>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = currentUser.id === listing.userId;
  const author = listing.author;
  const isSelling = listing.kind === 'SELL';

  const handleOrderSubmit = () => {
    const newOrder = createOrder({
      type: 'TRADE',
      sellerId: listing.userId,
      listingId: listing.id,
      agreedPrice: listing.price || 0n,
      agreedQuantity: listing.details?.quantity || 1,
      itemOrService: listing.title,
      initialMessage: `Order requested for ${listing.title} (x${listing.details?.quantity || 1}). Ready to meet in-game at /spawn.`,
    });
    router.push(`/orders/${newOrder.id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <Link
            href="/market"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Trading Board</span>
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
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Pause</span>
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
                    router.push('/market');
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

        {/* Trade Information Header */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-mono font-semibold text-[var(--accent)]">
                  {isSelling ? 'WTS (Selling)' : 'WTB (Buying)'}
                </span>
                <span aria-hidden="true">·</span>
                <span>Category: {listing.details?.category || 'Misc'}</span>
                <span aria-hidden="true">·</span>
                <span>{listing.isNegotiable ? 'Price Negotiable' : 'Firm Price'}</span>
                {listing.isPaused && <span className="text-[#DB6D28] font-mono">· PAUSED</span>}
                {listing.isFulfilled && <span className="text-[#3FB950] font-mono">· FULFILLED</span>}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {listing.title}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-left sm:text-right shrink-0">
              <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                Total Price ({listing.details?.quantity || 1} units)
              </div>
              <div className="text-2xl font-mono font-bold text-[var(--accent)] tabular-numbers">
                {formatCurrency(listing.price)}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                {formatCurrencyFull(listing.price)}
              </div>
            </div>
          </div>

          {/* Trade Parameters Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)] text-xs">
            <div>
              <div className="text-[var(--text-muted)]">Quantity Available:</div>
              <div className="font-mono font-semibold text-sm text-[var(--text-primary)] mt-0.5">
                {listing.details?.quantity || 1} units
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)]">Unit Price:</div>
              <div className="font-mono font-semibold text-sm text-[var(--accent)] mt-0.5">
                {listing.details?.unitPrice ? formatCurrency(listing.details.unitPrice) : 'Bundle only'}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)]">Terms:</div>
              <div className="text-sm text-[var(--text-primary)] mt-0.5">
                {listing.isNegotiable ? 'Open to offers' : 'Fixed rate'}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)]">Exchange:</div>
              <div className="text-sm text-[var(--text-primary)] mt-0.5">
                Spawn booth delivery
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Split: Seller Reputation & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Seller Reputation Profile (1 col) */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Trader Reputation
            </h3>

            <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={author.avatarUrl}
                  alt={author.minecraftIgn}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded bg-[#090C10] border border-[var(--border)] object-cover"
                />
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    {author.minecraftIgn}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Discord: {author.discordId}
                  </div>
                </div>
              </div>

              {/* Unboxed Trust Signals */}
              <div className="space-y-2 text-xs border-t border-[var(--border)] pt-3">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Positive Vouches:</span>
                  <span className="font-mono text-[#3FB950] font-semibold">+{author.positiveVouches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Negative Vouches:</span>
                  <span className="font-mono text-[var(--text-muted)]">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Completed Deals:</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">{author.completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Member Since:</span>
                  <span className="text-[var(--text-primary)]">{author.memberSince}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setOrderModalOpen(true)}
                disabled={listing.isPaused || listing.isFulfilled}
                className="w-full py-2.5 px-4 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md shadow-sm"
              >
                {isSelling ? 'Request to Buy Item' : 'Offer to Sell Item'}
              </button>
            </div>
          </div>

          {/* Description & Terms (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Trade Terms & Description
            </h3>

            <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg">
              <MarkdownRenderer content={listing.description} />
            </div>

            {/* Optional Attached Images */}
            {listing.images.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-[var(--text-muted)] font-medium">
                  Verified Screenshot Proof:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {listing.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded border border-[var(--border)] overflow-hidden bg-[#090C10]"
                    >
                      <img
                        src={img}
                        alt={`Trade Proof ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Initiate In-Game Trade Order
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Trading with <span className="font-mono text-[var(--text-primary)]">{author.minecraftIgn}</span> on Donut SMP.
              </p>
            </div>

            <div className="space-y-2 text-xs bg-[var(--surface-elevate)] p-4 rounded border border-[var(--border)] font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Item:</span>
                <span className="font-semibold text-[var(--text-primary)]">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Quantity:</span>
                <span className="text-[var(--text-primary)]">{listing.details?.quantity || 1} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Agreed Price:</span>
                <span className="font-bold text-[var(--accent)]">
                  {formatCurrency(listing.price)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Both parties must confirm delivery on-site once the exchange is completed in Donut SMP. This unlocks mutual vouch creation.
            </p>

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
                Confirm Order Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

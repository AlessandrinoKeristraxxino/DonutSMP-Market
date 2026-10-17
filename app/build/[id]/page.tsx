'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useQuotes } from '@/lib/data/QuotesContext';
import { formatCurrency, formatCurrencyFull } from '@/lib/currency';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { QuoteModal } from '@/components/build/QuoteModal';
import { HireBuilderModal } from '@/components/build/HireBuilderModal';
import {
  ChevronLeft,
  Hammer,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Send,
  User,
  Sparkles,
  AlertTriangle,
  FileText,
  Building,
  Check,
} from 'lucide-react';

export default function BuildListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { getListing, currentUser } = useListings();
  const { getQuotesForListing, getUserQuoteForListing, acceptQuote } = useQuotes();

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const listing = getListing(id);
  const quotesForListing = getQuotesForListing(id);
  const userExistingQuote = getUserQuoteForListing(id, currentUser.id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 text-center space-y-4">
          <Hammer className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
          <h1 className="text-xl font-bold">Build Listing Not Found</h1>
          <p className="text-sm text-[var(--text-muted)]">
            This construction service or client request may have been fulfilled or removed.
          </p>
          <Link
            href="/build"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] rounded"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Build Board</span>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = currentUser.id === listing.userId;
  const isService = listing.kind === 'SERVICE';
  const types = listing.details?.buildTypes || ['Base'];
  const turnaround = listing.details?.turnaroundDays;
  const deadline = listing.details?.deadline;

  const handleAcceptQuote = (quoteId: string) => {
    setAcceptError(null);
    setAcceptingQuoteId(quoteId);

    const result = acceptQuote(quoteId);
    if (!result.success || !result.orderId) {
      setAcceptError(result.error || 'Failed to accept quote.');
      setAcceptingQuoteId(null);
      return;
    }

    router.push(`/orders/${result.orderId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="border-b border-[var(--border)] pb-4 flex items-center justify-between">
          <Link
            href="/build"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Build Services</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
              isService ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {isService ? 'Builder Service' : 'Client Request'}
            </span>
          </div>
        </div>

        {/* Hero Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Author Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {types.map((t: string) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevate)] text-[var(--text-muted)] border border-[var(--border)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-snug">
                {listing.title}
              </h1>

              {/* Author Info Bar */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={`/u/${listing.author.minecraftIgn}`}
                  className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
                >
                  <div className="relative w-8 h-8 rounded bg-stone-800 overflow-hidden border border-[var(--border)]">
                    <Image
                      src={listing.author.avatarUrl}
                      alt={listing.author.minecraftIgn}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-mono">
                      {listing.author.minecraftIgn}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                      <span className="text-emerald-400 font-mono">+{listing.author.positiveVouches}</span>
                      <span>·</span>
                      <span>{listing.author.completedOrders} orders</span>
                    </div>
                  </div>
                </Link>

                <div className="h-4 w-px bg-[var(--border)] mx-1" />

                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Showcase Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-black/60 shadow-lg">
              <Image
                src={listing.images[0] || 'https://picsum.photos/seed/build/800/800'}
                alt={listing.title}
                fill
                priority
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Project Specifications Card */}
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Build Categories</span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">{types.join(', ')}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">
                  {isService ? 'Estimated Turnaround' : 'Project Deadline'}
                </span>
                <span className="font-semibold text-amber-300 font-mono">
                  {isService ? `${turnaround || 3} days guaranteed` : deadline || 'Flexible'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[11px]">Currency Policy</span>
                <span className="font-semibold text-emerald-400 font-mono">Donut SMP In-Game Only</span>
              </div>
            </div>

            {/* Markdown Description */}
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Project Description & Technical Brief</span>
              </h3>
              <div className="pt-2 border-t border-[var(--border)]">
                <MarkdownRenderer content={listing.description} />
              </div>
            </div>

            {/* Safety & Anti-Griefing Protocol Notice */}
            <div className="p-4 rounded-lg bg-[var(--surface-elevate)] border border-[var(--border)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-primary)] block mb-0.5">
                  Donut SMP Escrow & Verification Protocol
                </span>
                <p className="leading-relaxed text-[11px]">
                  Payment is agreed in in-game currency ($). Both client and contractor confirm delivery via the order state timeline before reputation vouches unlock. Real money (USD/EUR) transactions are strictly prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Action & Sidebar Column (1 col) */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-5 shadow-sm sticky top-20">
              <div className="space-y-1">
                <div className="text-xs text-[var(--text-muted)]">
                  {isService ? 'Service Pricing' : 'Client Maximum Budget'}
                </div>
                <div className="text-2xl font-mono font-bold text-amber-300">
                  {listing.price ? formatCurrency(listing.price) : 'Quote / Custom Estimate'}
                </div>
                {listing.price && (
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    {formatCurrencyFull(listing.price)} In-Game Currency
                  </div>
                )}
              </div>

              {/* SERVICE WORKFLOW: Hire Builder */}
              {isService && (
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  {isOwner ? (
                    <div className="p-3 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
                      This is your active service listing.
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsHireModalOpen(true)}
                      className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Hammer className="w-4 h-4" />
                      <span>Hire Builder / Request Order</span>
                    </button>
                  )}

                  <div className="text-[11px] text-[var(--text-muted)] space-y-1 pt-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{listing.author.positiveVouches} positive trade vouches</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{turnaround || 3} days guaranteed turnaround</span>
                    </div>
                  </div>
                </div>
              )}

              {/* REQUEST WORKFLOW: Quote Submissions & Review */}
              {!isService && (
                <div className="space-y-4 pt-3 border-t border-[var(--border)]">
                  {/* If user is owner: Review Quotes */}
                  {isOwner ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">
                          Submitted Builder Quotes ({quotesForListing.length})
                        </span>
                      </div>

                      {acceptError && (
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                          {acceptError}
                        </div>
                      )}

                      {quotesForListing.length === 0 ? (
                        <div className="p-4 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
                          No quotes submitted yet. Certified builders will review your request.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                          {quotesForListing.map((q) => (
                            <div
                              key={q.id}
                              className="p-3 bg-[var(--surface-elevate)] rounded border border-[var(--border)] space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <Link
                                  href={`/u/${q.builder.minecraftIgn}`}
                                  className="font-mono font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                                >
                                  {q.builder.minecraftIgn}
                                </Link>
                                <span className="font-mono font-bold text-amber-300">
                                  {formatCurrency(q.price)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[var(--accent)]" />
                                  <span>{q.etaDays} days ETA</span>
                                </span>
                                <span className="text-emerald-400 font-mono">
                                  +{q.builder.positiveVouches} vouches
                                </span>
                              </div>

                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-3 bg-[var(--canvas)] p-2 rounded">
                                {q.message}
                              </p>

                              <button
                                onClick={() => handleAcceptQuote(q.id)}
                                disabled={q.isAccepted || acceptingQuoteId === q.id}
                                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                              >
                                {q.isAccepted ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accepted</span>
                                  </>
                                ) : acceptingQuoteId === q.id ? (
                                  <span>Creating Order...</span>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Accept Quote & Start Order</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* If user is NOT owner: Submit Quote or view existing */
                    <div className="space-y-3">
                      {userExistingQuote ? (
                        <div className="p-4 bg-[var(--surface-elevate)] rounded border border-[var(--border)] space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-[var(--accent)]">Your Submitted Quote</span>
                            <span className="font-mono text-amber-300">
                              {formatCurrency(userExistingQuote.price)}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                            <span>ETA: {userExistingQuote.etaDays} days</span>
                            <span className={userExistingQuote.isAccepted ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                              {userExistingQuote.isAccepted ? 'Accepted by Client' : 'Pending Client Review'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] bg-[var(--canvas)] p-2 rounded line-clamp-3">
                            {userExistingQuote.message}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsQuoteModalOpen(true)}
                          className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Binding Quote / Bid</span>
                        </button>
                      )}

                      <div className="text-[11px] text-[var(--text-muted)]">
                        Quotes are legally binding under Donut SMP Market rules. Bids are reviewed directly by the client.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quote Submission Modal */}
      {isQuoteModalOpen && (
        <QuoteModal
          listingId={listing.id}
          listingTitle={listing.title}
          budgetMax={listing.price || undefined}
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}

      {/* Hire Builder Modal */}
      {isHireModalOpen && (
        <HireBuilderModal
          listingId={listing.id}
          listingTitle={listing.title}
          sellerId={listing.userId}
          sellerIgn={listing.author.minecraftIgn}
          price={listing.price}
          turnaroundDays={turnaround}
          isOpen={isHireModalOpen}
          onClose={() => setIsHireModalOpen(false)}
        />
      )}
    </div>
  );
}

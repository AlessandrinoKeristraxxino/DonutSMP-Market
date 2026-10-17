'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useOrders } from '@/lib/data/OrdersContext';
import { useVouches } from '@/lib/data/VouchesContext';
import { VouchCard } from '@/components/vouches/VouchCard';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import { formatCurrency } from '@/lib/currency';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  Calendar,
  ExternalLink,
  ChevronLeft,
  Coins,
  Palette,
  Hammer,
  BadgeCheck,
  UserCheck,
  MessageSquare,
} from 'lucide-react';

export default function PlayerProfilePage() {
  const params = useParams();
  const usernameParam = params?.username as string;

  const { users, listings } = useListings();
  const { orders } = useOrders();
  const { getVouchesForUser, getVouchesGivenByUser } = useVouches();

  const [activeTab, setActiveTab] = useState<'received' | 'given' | 'listings'>('received');

  // Match by minecraftIgn (case-insensitive) or by id
  const targetUser = users.find(
    (u) =>
      u.minecraftIgn.toLowerCase() === decodeURIComponent(usernameParam || '').toLowerCase() ||
      u.id === usernameParam
  );

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-60" />
          <h2 className="text-xl font-bold">Player Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">
            No Donut SMP player record found for &quot;{usernameParam}&quot;.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-black bg-[var(--accent)] rounded hover:bg-[var(--accent-hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Overview</span>
          </Link>
        </main>
      </div>
    );
  }

  const vouchesReceived = getVouchesForUser(targetUser.id);
  const vouchesGiven = getVouchesGivenByUser(targetUser.id);
  const userListings = listings.filter((l) => l.userId === targetUser.id);

  const completedOrdersCount = orders.filter(
    (o) =>
      (o.sellerId === targetUser.id || o.buyerId === targetUser.id) &&
      o.status === 'COMPLETED'
  ).length;

  const positiveCount = vouchesReceived.filter((v) => v.rating === 'POSITIVE').length;
  const negativeCount = vouchesReceived.filter((v) => v.rating === 'NEGATIVE').length;
  const totalVouches = positiveCount + negativeCount;
  const positivePercentage =
    totalVouches > 0 ? Math.round((positiveCount / totalVouches) * 100) : 100;

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* Player Identity Header (NameMC Clean Aesthetic) */}
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {/* Avatar Frame */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[var(--surface-elevate)] border-2 border-[var(--border)] overflow-hidden shrink-0 shadow-lg relative">
                <img
                  src={targetUser.avatarUrl || `https://picsum.photos/seed/${targetUser.id}/200/200`}
                  alt={targetUser.minecraftIgn}
                  className="w-full h-full object-cover"
                />
                {targetUser.role !== 'USER' && (
                  <span
                    className={`absolute bottom-1 right-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow ${
                      targetUser.role === 'ADMIN'
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {targetUser.role}
                  </span>
                )}
              </div>

              {/* Player Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] font-mono">
                    {targetUser.minecraftIgn}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[var(--surface-elevate)] text-stone-300 rounded border border-[var(--border)]">
                    <UserCheck className="w-3 h-3 text-[#3FB950]" />
                    <span>Verified IGN</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap">
                  <span className="font-mono">Discord: {targetUser.discordId}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {targetUser.memberSince}</span>
                  </span>
                </div>

                {targetUser.bio && (
                  <div className="pt-2 text-xs text-stone-300 max-w-2xl leading-relaxed">
                    <MarkdownRenderer content={targetUser.bio} />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="p-3 bg-[var(--surface-elevate)] border border-[var(--border)] rounded-lg text-center min-w-[120px]">
                <div className="text-lg font-bold font-mono text-[#3FB950]">
                  +{positiveCount}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  Positive Vouches
                </div>
              </div>

              <div className="p-3 bg-[var(--surface-elevate)] border border-[var(--border)] rounded-lg text-center min-w-[120px]">
                <div className="text-lg font-bold font-mono text-[var(--accent)]">
                  {completedOrdersCount || targetUser.completedOrders}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  Completed Deals
                </div>
              </div>
            </div>
          </div>

          {/* Reputation Ratio Bar */}
          <div className="border-t border-[var(--border)] pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
                <span className="font-semibold text-[var(--text-primary)]">
                  Community Trust Rating: {positivePercentage}%
                </span>
                <span className="text-[var(--text-muted)]">
                  ({positiveCount} positive, {negativeCount} negative)
                </span>
              </div>
              <span className="text-[var(--text-muted)]">
                {totalVouches} Total Verified Reviews
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden flex">
              <div
                className="bg-[#3FB950] h-full transition-all"
                style={{ width: `${positivePercentage}%` }}
              />
              <div
                className="bg-[#F85149] h-full transition-all"
                style={{ width: `${100 - positivePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--border)] flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'received'
                ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Vouches Received ({vouchesReceived.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('given')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'given'
                ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Vouches Given ({vouchesGiven.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'listings'
                ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Active Listings ({userListings.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {vouchesReceived.length === 0 ? (
              <div className="p-12 text-center border border-[var(--border)] bg-[var(--surface)] rounded-lg space-y-2">
                <ShieldCheck className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="font-semibold text-sm">No Vouches Received Yet</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Vouches unlock only after tracked in-game trades are completed on Donut SMP.
                </p>
              </div>
            ) : (
              vouchesReceived.map((vouch) => (
                <VouchCard
                  key={vouch.id}
                  id={vouch.id}
                  orderId={vouch.orderId}
                  author={vouch.author}
                  target={vouch.target}
                  rating={vouch.rating}
                  content={vouch.content}
                  images={vouch.images}
                  createdAt={vouch.createdAt}
                  modStatus={vouch.modStatus}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'given' && (
          <div className="space-y-4">
            {vouchesGiven.length === 0 ? (
              <div className="p-12 text-center border border-[var(--border)] bg-[var(--surface)] rounded-lg space-y-2">
                <MessageSquare className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="font-semibold text-sm">No Vouches Given Yet</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  This player hasn&apos;t written any reputation reviews for completed trades yet.
                </p>
              </div>
            ) : (
              vouchesGiven.map((vouch) => (
                <VouchCard
                  key={vouch.id}
                  id={vouch.id}
                  orderId={vouch.orderId}
                  author={vouch.author}
                  target={vouch.target}
                  rating={vouch.rating}
                  content={vouch.content}
                  images={vouch.images}
                  createdAt={vouch.createdAt}
                  modStatus={vouch.modStatus}
                  showTarget={true}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            {userListings.length === 0 ? (
              <div className="p-12 text-center border border-[var(--border)] bg-[var(--surface)] rounded-lg space-y-2">
                <Package className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="font-semibold text-sm">No Active Listings</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  This player doesn&apos;t have any active offers on the market currently.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={
                      listing.section === 'MAP_ART'
                        ? `/map-art/${listing.id}`
                        : listing.section === 'MARKET'
                        ? `/market/${listing.id}`
                        : `/build/${listing.id}`
                    }
                    className="border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] rounded-lg p-4 space-y-3 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span className="uppercase">{listing.section.replace('_', ' ')}</span>
                        <span>{listing.kind}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-1">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                        {listing.description.replace(/[#*`>-]/g, '').trim()}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--accent)] font-semibold">
                        {listing.price !== null ? `${formatCurrency(listing.price)} $` : 'Quote Only'}
                      </span>
                      <span className="text-[var(--text-muted)] inline-flex items-center gap-1">
                        <span>View Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useOrders } from '@/lib/data/OrdersContext';
import { useListings } from '@/lib/data/ListingsContext';
import { formatCurrency } from '@/lib/currency';
import { getStatusMetadata, OrderStatus } from '@/lib/orders/state-machine';
import { DEMO_USERS } from '@/lib/data/mock-db';
import {
  Package,
  Layers,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Store,
} from 'lucide-react';

export default function OrdersDashboardPage() {
  const { orders } = useOrders();
  const { currentUser } = useListings();

  const [roleTab, setRoleTab] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter orders for active user
  const relevantOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (roleTab === 'BUYER') return o.buyerId === currentUser.id;
        return o.sellerId === currentUser.id;
      })
      .filter((o) => {
        if (statusFilter === 'ALL') return true;
        return o.status === statusFilter;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, roleTab, currentUser.id, statusFilter]);

  // Overall counts
  const buyerCount = orders.filter((o) => o.buyerId === currentUser.id).length;
  const sellerCount = orders.filter((o) => o.sellerId === currentUser.id).length;

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Section: Orders & Reputation Management</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Currency Only</span>
              <span aria-hidden="true">·</span>
              <span>Tracked State Machine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              My Orders & Deal History
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
              Track active requests, in-game delivery progress, payment verifications, and vouches for player <strong className="text-[var(--text-primary)] font-mono">{currentUser.minecraftIgn}</strong>.
            </p>
          </div>
        </div>

        {/* Role Segmented Tabs (Buyer vs Seller) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-[var(--surface-elevate)] rounded-lg border border-[var(--border)] w-fit">
            <button
              onClick={() => {
                setRoleTab('BUYER');
                setStatusFilter('ALL');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                roleTab === 'BUYER'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Orders as Buyer ({buyerCount})</span>
            </button>

            <button
              onClick={() => {
                setRoleTab('SELLER');
                setStatusFilter('ALL');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                roleTab === 'SELLER'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Orders as Seller ({sellerCount})</span>
            </button>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'DISPUTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  statusFilter === st
                    ? 'bg-[var(--accent)] text-black font-semibold'
                    : 'bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {relevantOrders.length > 0 ? (
          <div className="space-y-4">
            {relevantOrders.map((ord) => {
              const otherUserId = roleTab === 'BUYER' ? ord.sellerId : ord.buyerId;
              const otherUser = DEMO_USERS.find((u) => u.id === otherUserId) || DEMO_USERS[0];
              const statusMeta = getStatusMetadata(ord.status);

              return (
                <div
                  key={ord.id}
                  className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg hover:border-[var(--accent)]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[var(--accent)]">
                        Order #{ord.orderNumber}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {ord.type.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                      <span className="text-[var(--text-muted)]">
                        Created {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                      {ord.itemOrService}
                    </h3>

                    {/* Unboxed Metadata with Typographic Separator */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span>{roleTab === 'BUYER' ? 'Seller' : 'Buyer'}: <strong className="font-mono text-[var(--text-primary)]">{otherUser.minecraftIgn}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#3FB950] font-mono">+{otherUser.positiveVouches} vouches</span>
                      <span aria-hidden="true">·</span>
                      <span>Quantity: {ord.agreedQuantity}x</span>
                    </div>
                  </div>

                  {/* Price & Status Block */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)] shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                        Snapshotted Price
                      </div>
                      <div className="text-lg font-mono font-bold text-[var(--accent)] tabular-numbers">
                        {formatCurrency(ord.agreedPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded border border-white/5 bg-[var(--surface-elevate)] ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>

                      <Link
                        href={`/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs rounded transition-colors shadow-sm"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center border border-[var(--border)] rounded-lg bg-[var(--surface)] space-y-3">
            <Package className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              No orders found for this filter
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              {roleTab === 'BUYER'
                ? "You haven't requested any items or map art with this status."
                : "You haven't received any incoming client deals matching this status."}
            </p>
            <div className="pt-2">
              <Link
                href="/market"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-elevate)] text-xs text-[var(--text-primary)] hover:bg-[var(--border)] rounded transition-colors font-medium"
              >
                <span>Browse Marketplace</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

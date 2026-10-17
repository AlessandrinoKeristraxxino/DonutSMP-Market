'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useOrders } from '@/lib/data/OrdersContext';
import { useVouches } from '@/lib/data/VouchesContext';
import { formatCurrency } from '@/lib/currency';
import {
  ShieldAlert,
  Users,
  Coins,
  Activity,
  History,
  RotateCcw,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Shield,
  Layers,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function AdminPage() {
  const {
    currentUser,
    setCurrentUserId,
    users,
    listings,
    setUserRole,
    toggleUserBan,
    auditLogs,
    resetToDefaults,
  } = useListings();

  const { orders } = useOrders();
  const { vouches } = useVouches();

  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT'>('USERS');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Check if admin
  const isAdmin = currentUser.role === 'ADMIN';

  // Calculate high-level economy stats
  const totalVolume = orders.reduce((sum, o) => {
    return sum + (o.status === 'COMPLETED' ? o.agreedPrice : 0n);
  }, 0n);

  const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const activeListingsCount = listings.filter((l) => !l.isFulfilled && !l.isPaused).length;
  const positiveVouchesCount = vouches.filter((v) => v.rating === 'POSITIVE' && v.modStatus === 'APPROVED').length;
  const totalApprovedVouches = vouches.filter((v) => v.modStatus === 'APPROVED').length;
  const satisfactionRate = totalApprovedVouches > 0
    ? ((positiveVouchesCount / totalApprovedVouches) * 100).toFixed(1)
    : '100.0';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-16 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Admin Clearance Required</h1>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              The Administrative Control Center is restricted to server staff with the <strong className="text-white">ADMIN</strong> role.
              You are currently logged in as <strong className="text-white">{currentUser.minecraftIgn}</strong> ({currentUser.role}).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] max-w-md mx-auto text-xs space-y-3">
            <div className="font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5">
              <Shield className="w-4 h-4 text-[var(--accent)]" />
              <span>Switch to Demo Admin to Inspect:</span>
            </div>
            <button
              onClick={() => setCurrentUserId('u-5')}
              className="w-full py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-black font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Switch to DonutAdmin (u-5)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Donut SMP Administration & Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Server Economy & User Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Manage user roles, ban enforcement, economy volume telemetry, and system audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (resetConfirm) {
                  resetToDefaults();
                  setResetConfirm(false);
                } else {
                  setResetConfirm(true);
                  setTimeout(() => setResetConfirm(false), 5000);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors border ${
                resetConfirm
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-white border-[var(--border)]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetConfirm ? 'Click to Confirm Reset' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Gross Trade Volume</span>
              <Coins className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-xl font-mono font-bold text-amber-300">
              {formatCurrency(totalVolume)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Completed in-game deals</div>
          </div>

          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Completed Orders</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {completedOrdersCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Across map art & builds</div>
          </div>

          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Active Listings</span>
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-mono font-bold text-sky-400">
              {activeListingsCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Unfulfilled market items</div>
          </div>

          <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Trust Satisfaction</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {satisfactionRate}%
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">Verified positive vouch ratio</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'USERS'
                ? 'bg-[var(--surface-elevate)] text-[var(--accent)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Player Accounts & Roles ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'AUDIT'
                ? 'bg-[var(--surface-elevate)] text-[var(--accent)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Security Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: User Management Table */}
        {activeTab === 'USERS' && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-elevate)] text-[var(--text-muted)] font-medium">
                    <th className="py-3 px-4">Player Handle</th>
                    <th className="py-3 px-4">Discord ID</th>
                    <th className="py-3 px-4">Reputation Score</th>
                    <th className="py-3 px-4">Completed Deals</th>
                    <th className="py-3 px-4">Security Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--surface-elevate)]/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/u/${u.minecraftIgn}`}
                          className="flex items-center gap-2 font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          <div className="relative w-6 h-6 rounded bg-stone-800 overflow-hidden shrink-0">
                            <Image
                              src={u.avatarUrl}
                              alt={u.minecraftIgn}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span>{u.minecraftIgn}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-muted)]">{u.discordId}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-semibold">+{u.positiveVouches}</span>
                        {u.negativeVouches > 0 && (
                          <span className="text-red-400 ml-1">-{u.negativeVouches}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--text-primary)]">{u.completedOrders}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e: any) => setUserRole(u.id, e.target.value)}
                          className="px-2 py-1 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="MOD">MOD</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            <Ban className="w-3 h-3" />
                            <span>Banned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => toggleUserBan(u.id, !u.isBanned)}
                            className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
                              u.isBanned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-red-600/80 hover:bg-red-600 text-white'
                            }`}
                          >
                            {u.isBanned ? 'Unban Player' : 'Ban Player'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Live Audit Trail */}
        {activeTab === 'AUDIT' && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-elevate)] text-[var(--text-muted)] font-medium">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-mono">
                  {auditLogs.map((log) => {
                    const actor = users.find((u) => u.id === log.actorId);
                    return (
                      <tr key={log.id} className="hover:bg-[var(--surface-elevate)]/50 transition-colors">
                        <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap text-[11px]">
                          {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          {actor?.minecraftIgn || log.actorId}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevate)] text-amber-300 border border-[var(--border)]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{log.targetType}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)] max-w-md truncate font-sans">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

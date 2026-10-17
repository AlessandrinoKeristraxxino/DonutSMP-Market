'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useListings } from '@/lib/data/ListingsContext';
import { useVouches } from '@/lib/data/VouchesContext';
import { Plus, ShieldAlert, User, Settings, Sliders } from 'lucide-react';

export function TopBar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUserId, users } = useListings();
  const { getPendingModerationItems } = useVouches();

  const isModOrAdmin = currentUser.role === 'MOD' || currentUser.role === 'ADMIN';
  const pendingCount = isModOrAdmin ? getPendingModerationItems().length : 0;

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/map-art', label: 'Map Art' },
    { href: '/market', label: 'Buy / Sell' },
    { href: '/build', label: 'Build Services' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--canvas)]/95 backdrop-blur-md border-b border-[var(--border)] px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
          >
            Donut SMP Market
          </Link>
        </div>

        {/* Zone 2: Concise Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--text-primary)] underline decoration-[var(--accent)] underline-offset-8 font-semibold'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mod Queue Link for staff */}
          {isModOrAdmin && (
            <Link
              href="/mod/queue"
              className={`hover:text-amber-300 transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                pathname.startsWith('/mod')
                  ? 'text-amber-300 font-semibold underline decoration-amber-400 underline-offset-8'
                  : 'text-amber-400/90'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mod Queue</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          {/* Admin link for administrators */}
          {currentUser.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`hover:text-amber-300 transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                pathname.startsWith('/admin')
                  ? 'text-amber-300 font-semibold underline decoration-amber-400 underline-offset-8'
                  : 'text-amber-400/90'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action + Profile Link + Settings + User Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Link to own reputation profile */}
          <Link
            href={`/u/${currentUser.minecraftIgn}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--surface-elevate)] hover:bg-stone-800 rounded border border-[var(--border)] text-xs text-stone-200 transition-colors"
            title="View my reputation profile"
          >
            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-mono font-medium">{currentUser.minecraftIgn}</span>
          </Link>

          {/* Settings icon link */}
          <Link
            href="/settings"
            className={`p-1.5 rounded border border-[var(--border)] transition-colors ${
              pathname === '/settings'
                ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                : 'bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-white hover:bg-stone-800'
            }`}
            title="Account & Drop Preferences"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Active IGN Profile Picker */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)]">Switch:</span>
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUserId(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-mono font-medium focus:outline-none cursor-pointer"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-[#161B22] text-white">
                  {user.minecraftIgn} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/create/map-art"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded-md shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Listing</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

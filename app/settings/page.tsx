'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { scanContent } from '@/lib/moderation/bot';
import {
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Void Miner', url: 'https://picsum.photos/seed/voidminer/200/200' },
  { label: 'Prism Pixel', url: 'https://picsum.photos/seed/prism/200/200' },
  { label: 'Zephyr Architect', url: 'https://picsum.photos/seed/zephyr/200/200' },
  { label: 'Nether Raider', url: 'https://picsum.photos/seed/netherknight/200/200' },
  { label: 'Ender Warden', url: 'https://picsum.photos/seed/enderwarden/200/200' },
];

export default function SettingsPage() {
  const { currentUser, updateUserProfile } = useListings();

  const [minecraftIgn, setMinecraftIgn] = useState(currentUser.minecraftIgn);
  const [discordId, setDiscordId] = useState(currentUser.discordId);
  const [displayName, setDisplayName] = useState(currentUser.name || currentUser.minecraftIgn);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [safeDropLocation, setSafeDropLocation] = useState(
    currentUser.tradePreferences?.safeDropLocation || 'Spawn Market Booth 4B'
  );
  const [preferredLobby, setPreferredLobby] = useState(
    currentUser.tradePreferences?.preferredLobby || 'Lobby 1 (Main Economy)'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    setErrorMessage(null);

    if (!minecraftIgn.trim()) {
      setErrorMessage('Minecraft IGN cannot be empty.');
      return;
    }

    if (!discordId.trim()) {
      setErrorMessage('Discord handle is required for trade coordination.');
      return;
    }

    // Anti-RMT check on bio
    if (bio.trim()) {
      const scan = scanContent(bio);
      if (!scan.isClean && scan.flaggedReason) {
        setErrorMessage(`Bio contains forbidden terms: ${scan.flaggedReason}. Real-money trading is not permitted.`);
        return;
      }
    }

    updateUserProfile(currentUser.id, {
      minecraftIgn: minecraftIgn.trim(),
      discordId: discordId.trim(),
      name: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      tradePreferences: {
        safeDropLocation: safeDropLocation.trim(),
        preferredLobby: preferredLobby.trim(),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Account & Reputation Settings</span>
              <span aria-hidden="true">·</span>
              <span>In-Game Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Player Identity & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Configure your verified Minecraft IGN, trade drop zones, and public reputation bio.
            </p>
          </div>

          <Link
            href={`/u/${currentUser.minecraftIgn}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[var(--text-primary)] bg-[var(--surface-elevate)] hover:bg-stone-800 border border-[var(--border)] rounded transition-colors self-start sm:self-auto"
          >
            <User className="w-4 h-4 text-[var(--accent)]" />
            <span>View Public Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </Link>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile preferences successfully saved! Changes are live across your listings and profile.</span>
            </div>
            <Link
              href={`/u/${minecraftIgn}`}
              className="underline font-semibold hover:text-white"
            >
              Preview Profile →
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity Section */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User className="w-4 h-4 text-[var(--accent)]" />
              <span>Minecraft In-Game Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Minecraft In-Game Username (IGN) *
                </label>
                <input
                  type="text"
                  value={minecraftIgn}
                  onChange={(e) => setMinecraftIgn(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Must match your exact in-game character handle for safe dropoffs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Discord Handle *
                </label>
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="e.g. Player#1234 or @handle"
                  className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Used for order notifications and voice coordination.
                </p>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                Character Skin / Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-lg bg-stone-900 border border-[var(--border)] overflow-hidden shrink-0">
                  <Image
                    src={avatarUrl || 'https://picsum.photos/seed/voidminer/200/200'}
                    alt="Skin preview"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Custom image URL"
                    className="w-full px-3 py-1.5 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none font-mono"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-[var(--text-muted)]">Presets:</span>
                    {PRESET_AVATARS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setAvatarUrl(p.url)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          avatarUrl === p.url
                            ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
                            : 'bg-[var(--surface-elevate)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Public Bio */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center justify-between">
                <span>Public Profile Bio (Markdown allowed)</span>
                <span className="text-[11px] font-mono">{bio.length}/500</span>
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your trading specialty, main base coordinates, active farm stock, or build commission turnaround..."
                className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Trade Preferences Section */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
              <span>In-Game Trade & Drop Preferences</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Default Safe Drop Location
                </label>
                <input
                  type="text"
                  value={safeDropLocation}
                  onChange={(e) => setSafeDropLocation(e.target.value)}
                  placeholder="e.g. Spawn Booth 12 or /warp trade"
                  className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none font-mono"
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Auto-populated in order chats to expedite in-game meetups.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Preferred Donut SMP Lobby
                </label>
                <select
                  value={preferredLobby}
                  onChange={(e) => setPreferredLobby(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                >
                  <option value="Lobby 1 (Main Economy)">Lobby 1 (Main Economy)</option>
                  <option value="Lobby 2 (Hardcore Survival)">Lobby 2 (Hardcore Survival)</option>
                  <option value="Lobby 3 (Builders Realm)">Lobby 3 (Builders Realm)</option>
                </select>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Primary server instance for trades.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[var(--text-muted)]">
              Role: <span className="font-mono font-semibold text-[var(--accent)]">{currentUser.role}</span>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Preferences</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

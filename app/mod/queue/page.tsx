'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useListings } from '@/lib/data/ListingsContext';
import { useVouches } from '@/lib/data/VouchesContext';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronLeft,
  FileText,
  UserX,
  History,
  Lock,
} from 'lucide-react';

export default function ModerationQueuePage() {
  const { currentUser, setCurrentUserId, users } = useListings();
  const {
    getPendingModerationItems,
    moderateVouch,
    auditLogs,
  } = useVouches();

  const [activeTab, setActiveTab] = useState<'queue' | 'audit'>('queue');
  const [modNote, setModNote] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);

  const isModOrAdmin = currentUser.role === 'MOD' || currentUser.role === 'ADMIN';

  const pendingItems = getPendingModerationItems();

  const handleAction = (vouchId: string, action: 'APPROVE' | 'REJECT') => {
    setActingId(vouchId);
    const note = modNote[vouchId]?.trim();
    moderateVouch(vouchId, action, note);
    setActingId(null);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Moderation Review & Trust Queue
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Screen flagged vouches, enforce anti-RMT compliance, and audit staff actions on Donut SMP.
            </p>
          </div>

          {/* Quick Staff Switcher (Demonstration Helper) */}
          <div className="flex items-center gap-2 bg-[var(--surface-elevate)] px-3 py-2 rounded-lg border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)] font-mono">Current Role:</span>
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                isModOrAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-700 text-stone-300'
              }`}
            >
              {currentUser.role}
            </span>
            {!isModOrAdmin && (
              <button
                onClick={() => {
                  const modUser = users.find((u) => u.role === 'MOD');
                  if (modUser) setCurrentUserId(modUser.id);
                }}
                className="ml-2 text-[11px] font-semibold text-[var(--accent)] hover:underline"
              >
                Switch to Mod
              </button>
            )}
          </div>
        </div>

        {/* Permission Gate Warning if USER */}
        {!isModOrAdmin && (
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-xs text-amber-200">
                Staff Authorization Required
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                You are currently logged in as <strong>{currentUser.minecraftIgn}</strong> (Role: {currentUser.role}). Only <strong>MOD</strong> and <strong>ADMIN</strong> roles can resolve flagged queue items. Use the profile selector above or in the navigation bar to switch to <strong>Aegis Sentinel (MOD)</strong> to test actions.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-[var(--border)] flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-3 transition-colors flex items-center gap-2 relative ${
              activeTab === 'queue'
                ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>Review Queue</span>
            <span className="text-xs font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded">
              {pendingItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 transition-colors flex items-center gap-2 relative ${
              activeTab === 'audit'
                ? 'text-[var(--text-primary)] font-semibold border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Staff Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* Queue Tab Content */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {pendingItems.length === 0 ? (
              <div className="p-12 text-center border border-[var(--border)] bg-[var(--surface)] rounded-lg space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#3FB950] mx-auto opacity-70" />
                <h3 className="font-semibold text-base">Moderation Queue is Clear</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  All submitted vouches and marketplace content have been successfully screened by the automated bot.
                </p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-6 space-y-4 shadow-lg hover:border-stone-700 transition-colors"
                >
                  {/* Top Bar: Title, Authors, Flag reasons */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded border border-amber-500/30">
                          Automated Flag
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-2">
                        <span>
                          Author:{' '}
                          <Link
                            href={`/u/${item.authorIgn}`}
                            className="text-[var(--text-primary)] hover:underline font-semibold"
                          >
                            @{item.authorIgn}
                          </Link>
                        </span>
                        <span>·</span>
                        <span>
                          Target:{' '}
                          <Link
                            href={`/u/${item.targetIgn}`}
                            className="text-[var(--text-primary)] hover:underline font-semibold"
                          >
                            @{item.targetIgn}
                          </Link>
                        </span>
                        <span>·</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {item.vouchId && (
                      <Link
                        href={`/orders/${item.vouchId.replace('vouch-', '')}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent)] hover:underline"
                      >
                        <span>Inspect Order</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Flag Reasons Callout */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs space-y-1">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Detected Flags:
                    </span>
                    <ul className="list-disc list-inside text-stone-300 text-xs pl-1">
                      {item.flagReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase text-[var(--text-muted)] block">
                      Submitted Text
                    </label>
                    <div className="p-3 bg-[var(--surface-elevate)] border border-[var(--border)] rounded text-xs leading-relaxed">
                      <MarkdownRenderer content={item.content} />
                    </div>
                  </div>

                  {/* Proof Screenshots if any */}
                  {item.images.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-[var(--text-muted)] block">
                        Attached Trade Proof ({item.images.length})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {item.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-video rounded border border-[var(--border)] overflow-hidden bg-black"
                          >
                            <img
                              src={img}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moderator Action Controls */}
                  <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Optional moderator review note (e.g. 'False alarm, verified in-game')..."
                      value={modNote[item.vouchId || ''] || ''}
                      onChange={(e) =>
                        setModNote({ ...modNote, [item.vouchId || '']: e.target.value })
                      }
                      disabled={!isModOrAdmin}
                      className="flex-1 px-3 py-1.5 bg-[var(--surface-elevate)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
                    />

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => item.vouchId && handleAction(item.vouchId, 'REJECT')}
                        disabled={!isModOrAdmin || actingId === item.vouchId}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#F85149] hover:bg-rose-600 disabled:opacity-50 transition-colors rounded shadow-sm inline-flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Vouch</span>
                      </button>

                      <button
                        onClick={() => item.vouchId && handleAction(item.vouchId, 'APPROVE')}
                        disabled={!isModOrAdmin || actingId === item.vouchId}
                        className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#3FB950] hover:bg-emerald-400 disabled:opacity-50 transition-colors rounded shadow-sm inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Vouch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audit Log Tab Content */}
        {activeTab === 'audit' && (
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-elevate)]/40 flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
                Staff Decision Audit Trail
              </h3>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Permanent immutable record
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No audit entries recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-semibold text-[var(--text-primary)]">
                          @{log.actorIgn}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'APPROVE_VOUCH'
                              ? 'bg-emerald-500/20 text-[#3FB950]'
                              : 'bg-rose-500/20 text-[#F85149]'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[var(--text-muted)]">
                          on {log.targetType} #{log.targetId}
                        </span>
                      </div>
                      <p className="text-[var(--text-muted)] text-[11px]">
                        {log.details}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

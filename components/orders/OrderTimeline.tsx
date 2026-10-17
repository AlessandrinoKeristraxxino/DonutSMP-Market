'use client';

import React from 'react';
import { OrderStatus, getStatusMetadata } from '@/lib/orders/state-machine';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { DEMO_USERS } from '@/lib/data/mock-db';

interface OrderEventRecord {
  id: string;
  actorId: string;
  status: OrderStatus | string;
  note?: string;
  createdAt: string;
}

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  events: OrderEventRecord[];
}

const ORDER_STEPS: OrderStatus[] = [
  'REQUESTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'DELIVERED',
  'COMPLETED',
];

export function OrderTimeline({ currentStatus, events }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';
  const isDisputed = currentStatus === 'DISPUTED';

  const currentStepIndex = ORDER_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* 1. Linear Visual Stepper */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg">
        <div className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)] mb-4">
          Lifecycle Progress
        </div>

        {isCancelled ? (
          <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded flex items-center gap-2 text-xs text-[#F85149]">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>This order was cancelled prior to in-game delivery.</span>
          </div>
        ) : isDisputed ? (
          <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded flex items-center gap-2 text-xs text-[#F85149]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This order is currently flagged for moderator dispute review.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {ORDER_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStatus === step;
              const meta = getStatusMetadata(step);

              return (
                <div
                  key={step}
                  className={`p-3 rounded border flex flex-col justify-between transition-colors ${
                    isCurrent
                      ? 'border-[var(--accent)] bg-[var(--surface-elevate)] ring-1 ring-[var(--accent)]'
                      : isPassed
                      ? 'border-[#3FB950]/30 bg-[#3FB950]/5 text-[#3FB950]'
                      : 'border-[var(--border)] bg-[var(--surface-elevate)]/30 text-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      0{idx + 1}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="font-semibold text-xs mt-2 text-[var(--text-primary)]">
                    {meta.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Chronological Audit Event History */}
      <div className="space-y-3">
        <div className="text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
          Order Events Timeline ({events.length})
        </div>

        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-lg divide-y divide-[var(--border)]">
          {events.map((ev) => {
            const actor = DEMO_USERS.find((u) => u.id === ev.actorId);
            const actorName = actor ? actor.minecraftIgn : 'System';

            return (
              <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">
                      Status set to <strong className="font-mono text-[var(--accent)]">{ev.status}</strong> by{' '}
                      <span className="font-mono text-stone-200">{actorName}</span>
                    </div>
                    {ev.note && (
                      <p className="text-[var(--text-muted)] mt-0.5 leading-relaxed">
                        &quot;{ev.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[var(--text-muted)] shrink-0 sm:text-right">
                  {new Date(ev.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

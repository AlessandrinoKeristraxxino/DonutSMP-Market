'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DemoUser } from '@/lib/data/mock-db';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  X,
  FileCheck,
} from 'lucide-react';

interface VouchCardProps {
  id: string;
  orderId: string;
  orderNumber?: number;
  author: DemoUser;
  target?: DemoUser;
  rating: 'POSITIVE' | 'NEGATIVE';
  content: string;
  images: string[];
  createdAt: string;
  modStatus?: 'APPROVED' | 'NEEDS_REVIEW' | 'REJECTED';
  showTarget?: boolean;
}

export function VouchCard({
  orderId,
  orderNumber,
  author,
  target,
  rating,
  content,
  images,
  createdAt,
  modStatus = 'APPROVED',
  showTarget = false,
}: VouchCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isPositive = rating === 'POSITIVE';

  return (
    <article className="border border-[var(--border)] bg-[var(--surface)] rounded-lg p-5 space-y-4 hover:border-stone-700 transition-colors">
      {/* Header Row: Author info, rating pill, order badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/u/${author.minecraftIgn}`}
            className="flex items-center gap-2.5 group"
          >
            {/* Minecraft Player Avatar Box */}
            <div className="w-9 h-9 rounded bg-[var(--surface-elevate)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={author.avatarUrl || `https://picsum.photos/seed/${author.id}/100/100`}
                alt={author.minecraftIgn}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {author.minecraftIgn}
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[var(--surface-elevate)] text-stone-300 rounded border border-[var(--border)]">
                  +{author.positiveVouches}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {author.discordId}
              </p>
            </div>
          </Link>

          {showTarget && target && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] pl-2 border-l border-[var(--border)]">
              <span>to</span>
              <Link
                href={`/u/${target.minecraftIgn}`}
                className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] font-mono"
              >
                @{target.minecraftIgn}
              </Link>
            </div>
          )}
        </div>

        {/* Right side: Rating & Order Link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {modStatus === 'NEEDS_REVIEW' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded">
              <Clock className="w-3 h-3" />
              <span>Pending Review</span>
            </span>
          )}

          {isPositive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#3FB950] bg-[#3FB950]/10 border border-[#3FB950]/30 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+1 Positive Vouch</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#F85149] bg-[#F85149]/10 border border-[#F85149]/30 rounded">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>-1 Negative Vouch</span>
            </span>
          )}

          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface-elevate)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
            title="View verified tracked order"
          >
            <ShieldCheck className="w-3 h-3 text-[var(--accent)]" />
            <span>Order #{orderNumber || orderId.replace('ord-', '')}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </Link>

          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Markdown Body */}
      <div className="text-xs text-[var(--text-primary)] leading-relaxed">
        <MarkdownRenderer content={content} />
      </div>

      {/* Attached Trade Proof Images */}
      {images && images.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            <FileCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Attached In-Game Trade Proof ({images.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className="group relative aspect-video rounded overflow-hidden border border-[var(--border)] bg-[var(--surface-elevate)] hover:border-[var(--accent)] transition-colors text-left"
              >
                <img
                  src={img}
                  alt={`Proof screenshot ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Proof Images */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedImage}
              alt="Proof full preview"
              className="max-h-[82vh] w-auto max-w-full object-contain rounded"
            />
          </div>
        </div>
      )}
    </article>
  );
}

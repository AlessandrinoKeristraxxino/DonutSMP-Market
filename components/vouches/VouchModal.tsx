'use client';

import React, { useState } from 'react';
import { useVouches } from '@/lib/data/VouchesContext';
import { OrderWithParties } from '@/lib/data/OrdersContext';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { ImageUploader, UploadedImageItem } from '@/components/uploads/ImageUploader';
import { scanContent } from '@/lib/moderation/bot';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface VouchModalProps {
  order: OrderWithParties;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VouchModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: VouchModalProps) {
  const { createVouch } = useVouches();

  const [rating, setRating] = useState<'POSITIVE' | 'NEGATIVE'>('POSITIVE');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time pre-validation with moderation bot
  const liveScan = scanContent(content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (content.trim().length < 10) {
      setErrorMessage('Please enter at least 10 characters for your vouch description.');
      return;
    }

    if (liveScan.decision === 'REJECTED') {
      setErrorMessage(liveScan.summary);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = createVouch({
        orderId: order.id,
        rating,
        content,
        images: images.map((i) => i.url),
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to submit vouch.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while submitting your vouch.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Write Verified Reputation Vouch
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Order #{order.orderNumber} ({order.itemOrService}) · Tracked on Donut SMP
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 bg-[#F85149]/15 border border-[#F85149]/40 rounded text-xs text-[#F85149] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Choice: +1 vs -1 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Trade Verdict & Rating
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRating('POSITIVE')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-xs font-semibold transition-all ${
                  rating === 'POSITIVE'
                    ? 'border-[#3FB950] bg-[#3FB950]/15 text-[#3FB950] ring-1 ring-[#3FB950]'
                    : 'border-[var(--border)] bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>+1 Positive Vouch (Honest & Completed)</span>
              </button>

              <button
                type="button"
                onClick={() => setRating('NEGATIVE')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-xs font-semibold transition-all ${
                  rating === 'NEGATIVE'
                    ? 'border-[#F85149] bg-[#F85149]/15 text-[#F85149] ring-1 ring-[#F85149]'
                    : 'border-[var(--border)] bg-[var(--surface-elevate)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>-1 Negative Vouch (Scam / Grief / Broken Deal)</span>
              </button>
            </div>
          </div>

          {/* Markdown Review */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Vouch Review (Markdown)
              </label>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                Formatting & tables supported
              </span>
            </div>

            <MarkdownEditor
              value={content}
              onChange={setContent}
              maxLength={1500}
              minHeight="140px"
              placeholder="Describe your trade experience, delivery speed, item condition, or build quality..."
            />

            {/* Live Auto-Bot Indicator */}
            {liveScan.flags.length > 0 && (
              <div
                className={`p-2.5 rounded text-xs border ${
                  liveScan.decision === 'REJECTED'
                    ? 'bg-[#F85149]/10 border-[#F85149]/30 text-[#F85149]'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    Auto-Moderation Notice:{' '}
                    {liveScan.decision === 'REJECTED' ? 'Forbidden Content' : 'Manual Review Queue'}
                  </span>
                </div>
                <p className="text-[11px] mt-1 opacity-90">{liveScan.summary}</p>
              </div>
            )}
          </div>

          {/* Proof Screenshot Attachment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                In-Game Proof Screenshots (Optional, Highly Recommended)
              </label>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                Max 4 images · 5 MB
              </span>
            </div>

            <ImageUploader
              images={images}
              onChange={setImages}
              maxCount={4}
              label="Drop in-game trade window, /spawn drop, or map frame screenshots"
              helperText="EXIF metadata stripped automatically before saving."
            />
          </div>

          {/* TOS Reminder */}
          <div className="p-3 bg-[var(--surface-elevate)] border border-[var(--border)] rounded text-[11px] text-[var(--text-muted)] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
            <p>
              Donut SMP strictly enforces in-game currency only. Any real-money references, PayPal links, or off-server trading will lead to permanent platform and in-game bans.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || liveScan.decision === 'REJECTED'}
              className="px-5 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded shadow-sm"
            >
              {isSubmitting ? 'Posting Vouch...' : 'Submit Verified Vouch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuotes } from '@/lib/data/QuotesContext';
import { useListings } from '@/lib/data/ListingsContext';
import { parseCurrency, formatCurrency } from '@/lib/currency';
import { scanContent } from '@/lib/moderation/bot';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import {
  X,
  Send,
  AlertTriangle,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface QuoteModalProps {
  listingId: string;
  listingTitle: string;
  budgetMax?: bigint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuoteModal({
  listingId,
  listingTitle,
  budgetMax,
  isOpen,
  onClose,
  onSuccess,
}: QuoteModalProps) {
  const { submitQuote } = useQuotes();
  const { currentUser } = useListings();

  const [priceInput, setPriceInput] = useState('');
  const [etaDays, setEtaDays] = useState(3);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parsedPrice = priceInput.trim() ? parseCurrency(priceInput) : null;
  const modScan = message ? scanContent(message) : { decision: 'APPROVED' as const, flags: [], summary: '' };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parsedPrice || parsedPrice <= 0n) {
      setError('Please specify a valid in-game currency bid (e.g. 500k, 1.8m). Real-money fiat is forbidden.');
      return;
    }

    if (etaDays < 1) {
      setError('Estimated turnaround must be at least 1 day.');
      return;
    }

    if (message.trim().length < 15) {
      setError('Please provide a proposal pitch explaining your build process (min 15 characters).');
      return;
    }

    setIsSubmitting(true);
    const result = submitQuote({
      listingId,
      price: parsedPrice,
      etaDays,
      message,
    });

    if (!result.success) {
      setError(result.error || 'Failed to submit quote.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Builder Quote</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Submit Project Proposal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-elevate)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Context */}
        <div className="mt-4 p-3 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-xs space-y-1">
          <div className="text-[var(--text-muted)]">Request Target:</div>
          <div className="font-semibold text-[var(--text-primary)] truncate">{listingTitle}</div>
          {budgetMax && (
            <div className="text-[var(--text-muted)] flex items-center gap-1 mt-1">
              <span>Client Max Budget:</span>
              <span className="font-mono text-amber-300 font-semibold">{formatCurrency(budgetMax)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Price & Turnaround Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Your Quote Price (In-Game $)</span>
              </label>
              <input
                type="text"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 1.8m or 850k"
                className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <div className="mt-1 text-[11px] font-mono text-[var(--text-muted)]">
                {parsedPrice ? `Interpreted: ${formatCurrency(parsedPrice)}` : 'Shorthand: 500k, 1.5m, 2b'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Turnaround (Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={etaDays}
                onChange={(e) => setEtaDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-sm text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                Estimated completion time
              </div>
            </div>
          </div>

          {/* Proposal Message with Markdown Editor */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Proposal Pitch & Technical Approach (Markdown)
            </label>
            <MarkdownEditor
              value={message}
              onChange={setMessage}
              placeholder="Explain how you will execute the build, materials required, past experience, and schematic alignment..."
              maxLength={1000}
              minHeight="110px"
            />
          </div>

          {/* Moderation Scanner Warning if flagged */}
          {modScan.decision !== 'APPROVED' && (
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{modScan.summary}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] font-mono">
              Bidding as: <span className="text-[var(--text-primary)] font-semibold">{currentUser.minecraftIgn}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-elevate)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !parsedPrice || modScan.decision === 'REJECTED'}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Send Binding Quote'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

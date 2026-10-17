'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/lib/data/OrdersContext';
import { useListings } from '@/lib/data/ListingsContext';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  Hammer,
  MapPin,
  Package,
  FileText,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface HireBuilderModalProps {
  listingId: string;
  listingTitle: string;
  sellerId: string;
  sellerIgn: string;
  price: bigint | null;
  turnaroundDays?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function HireBuilderModal({
  listingId,
  listingTitle,
  sellerId,
  sellerIgn,
  price,
  turnaroundDays = 3,
  isOpen,
  onClose,
}: HireBuilderModalProps) {
  const router = useRouter();
  const { createOrder } = useOrders();
  const { currentUser } = useListings();

  const [coordsX, setCoordsX] = useState('');
  const [coordsY, setCoordsY] = useState('');
  const [coordsZ, setCoordsZ] = useState('');
  const [dimension, setDimension] = useState<'Overworld' | 'Nether' | 'End'>('Overworld');
  const [materialsSupplied, setMaterialsSupplied] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentUser.id === sellerId) {
      setError('You cannot hire yourself or create an order on your own service.');
      return;
    }

    const agreedPrice = price || 1_000_000n; // fallback if quote-only

    setIsSubmitting(true);
    try {
      const coordStr = coordsX && coordsZ ? ` at [${coordsX}, ${coordsY || '~'}, ${coordsZ}] (${dimension})` : '';
      const order = createOrder({
        type: 'BUILD',
        sellerId,
        listingId,
        agreedPrice,
        agreedQuantity: 1,
        itemOrService: `${listingTitle}${coordStr}`,
        initialMessage: `Client Order Request:\n- Location: ${dimension} ${coordStr || 'To be shared in chat'}\n- Materials Supplied: ${materialsSupplied ? 'Yes (stored in chests on-site)' : 'No (Builder supplies / market cost added)'}\n- Notes: ${notes.trim() || 'Standard build specifications.'}`,
      });

      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize order request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
              <Hammer className="w-3.5 h-3.5" />
              <span>Commission Build Service</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Hire Builder: {sellerIgn}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--surface-elevate)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Summary Card */}
        <div className="mt-4 p-3 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-xs space-y-1">
          <div className="text-[var(--text-muted)]">Service:</div>
          <div className="font-semibold text-[var(--text-primary)] truncate">{listingTitle}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)] text-[var(--text-muted)]">
            <span>Agreed Base Price:</span>
            <span className="font-mono text-amber-300 font-semibold text-sm">
              {price ? formatCurrency(price) : 'Quote / Custom Estimate'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Coordinates Inputs */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Project Build Coordinates (In-Game)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="X: 1250"
                value={coordsX}
                onChange={(e) => setCoordsX(e.target.value)}
                className="px-2.5 py-1.5 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Y: 64"
                value={coordsY}
                onChange={(e) => setCoordsY(e.target.value)}
                className="px-2.5 py-1.5 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Z: -480"
                value={coordsZ}
                onChange={(e) => setCoordsZ(e.target.value)}
                className="px-2.5 py-1.5 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent)] focus:outline-none"
              />
              <select
                value={dimension}
                onChange={(e: any) => setDimension(e.target.value)}
                className="px-2 py-1.5 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
              >
                <option value="Overworld">Overworld</option>
                <option value="Nether">Nether</option>
                <option value="End">The End</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Coordinates can also be coordinated in encrypted order chat.
            </p>
          </div>

          {/* Materials Option */}
          <div className="p-3 bg-[var(--canvas)] rounded border border-[var(--border)]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={materialsSupplied}
                onChange={(e) => setMaterialsSupplied(e.target.checked)}
                className="mt-0.5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
              />
              <div className="text-xs">
                <span className="font-medium text-[var(--text-primary)]">I will provide construction materials on-site</span>
                <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                  Obsidian, concrete, terracotta, redstone, and glazed blocks placed in locked chests at build area.
                </p>
              </div>
            </label>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Project Brief & Special Instructions</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need the farm perimeter cleared first, schematic file available on request, please leave room for future storage expansion..."
              className="w-full px-3 py-2 bg-[var(--canvas)] border border-[var(--border)] rounded text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>

          {/* Anti-RMT reminder */}
          <div className="p-2.5 rounded bg-[var(--surface-elevate)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>In-game currency only. Both parties confirm delivery via order timeline before vouch unlock.</span>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)] font-mono">
              Hiring as: <span className="text-[var(--text-primary)] font-semibold">{currentUser.minecraftIgn}</span>
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
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors rounded shadow-sm"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Creating Order...' : 'Confirm & Request Order'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

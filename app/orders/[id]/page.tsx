'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { useOrders } from '@/lib/data/OrdersContext';
import { useListings } from '@/lib/data/ListingsContext';
import { useVouches } from '@/lib/data/VouchesContext';
import { formatCurrency, formatCurrencyFull } from '@/lib/currency';
import {
  getStatusMetadata,
  canTransition,
  OrderAction,
} from '@/lib/orders/state-machine';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderChat } from '@/components/orders/OrderChat';
import { ImageUploader, UploadedImageItem } from '@/components/uploads/ImageUploader';
import { VouchModal } from '@/components/vouches/VouchModal';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  ThumbsUp,
  Coins,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    getOrder,
    transitionOrder,
    sendOrderMessage,
    toggleBuyerPayment,
    toggleSellerPayment,
    addOrderEvidence,
    getUserRoleForOrder,
  } = useOrders();

  const { currentUser } = useListings();
  const { getVouchForOrder } = useVouches();
  const [evidenceImages, setEvidenceImages] = useState<UploadedImageItem[]>([]);
  const [actionModal, setActionModal] = useState<{ action: OrderAction; label: string } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isVouchModalOpen, setIsVouchModalOpen] = useState(false);

  const order = getOrder(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans">
        <TopBar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-60" />
          <h2 className="text-xl font-bold">Order Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">
            This order ID does not exist in the Donut SMP database.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-black bg-[var(--accent)] rounded hover:bg-[var(--accent-hover)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Orders Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  const actorRole = getUserRoleForOrder(order);
  const statusMeta = getStatusMetadata(order.status);
  const isBuyer = currentUser.id === order.buyerId;
  const isSeller = currentUser.id === order.sellerId;
  const isModOrAdmin = currentUser.role === 'MOD' || currentUser.role === 'ADMIN';

  // Available transitions
  const canAccept = canTransition(order.status, 'ACCEPT', actorRole).allowed;
  const canStart = canTransition(order.status, 'START', actorRole).allowed;
  const canDeliver = canTransition(order.status, 'DELIVER', actorRole).allowed;
  const canComplete = canTransition(order.status, 'COMPLETE', actorRole).allowed;
  const canCancel = canTransition(order.status, 'CANCEL', actorRole).allowed;
  const canDispute = canTransition(order.status, 'DISPUTE', actorRole).allowed;
  const canResolveComplete = canTransition(order.status, 'RESOLVE_COMPLETE', actorRole).allowed;
  const canResolveCancel = canTransition(order.status, 'RESOLVE_CANCEL', actorRole).allowed;

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    transitionOrder(order.id, actionModal.action, actionNote.trim() || undefined);
    setActionModal(null);
    setActionNote('');
  };

  const handleEvidenceUpdate = (newItems: UploadedImageItem[]) => {
    setEvidenceImages(newItems);
    if (newItems.length > 0) {
      const latest = newItems[newItems.length - 1];
      addOrderEvidence(order.id, latest.url);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent)] selection:text-black">
      <TopBar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Orders Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">Viewing as:</span>
            <span
              className={`font-mono font-semibold px-2 py-0.5 rounded text-xs ${
                isBuyer
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : isSeller
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : isModOrAdmin
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              {isBuyer ? 'BUYER' : isSeller ? 'SELLER' : isModOrAdmin ? currentUser.role : 'OBSERVER'} ({currentUser.minecraftIgn})
            </span>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-mono font-bold text-[var(--accent)]">
                  Order #{order.orderNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>Type: {order.type.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {order.itemOrService}
              </h1>

              {/* Unboxed Metadata with Typographic Separator */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] pt-1">
                <span>Buyer: <strong className="font-mono text-[var(--text-primary)]">{order.buyer.minecraftIgn}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Seller: <strong className="font-mono text-[var(--text-primary)]">{order.seller.minecraftIgn}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Agreed Qty: {order.agreedQuantity}x</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[var(--surface-elevate)] rounded border border-[var(--border)] text-left sm:text-right shrink-0">
              <div className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                Snapshotted In-Game Price
              </div>
              <div className="text-3xl font-mono font-bold text-[var(--accent)] tabular-numbers">
                {formatCurrency(order.agreedPrice)}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                {formatCurrencyFull(order.agreedPrice)}
              </div>
            </div>
          </div>

          {/* Interactive State Action Toolbar */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Current State:</span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded bg-[var(--surface-elevate)] border border-white/5 ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
              <span className="text-xs text-[var(--text-muted)] hidden md:inline">
                ({statusMeta.description})
              </span>
            </div>

            {/* Permitted Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {canAccept && (
                <button
                  onClick={() => setActionModal({ action: 'ACCEPT', label: 'Accept Order' })}
                  className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded shadow-sm"
                >
                  Accept Order
                </button>
              )}

              {canStart && (
                <button
                  onClick={() => setActionModal({ action: 'START', label: 'Start Work' })}
                  className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded shadow-sm"
                >
                  Start Work
                </button>
              )}

              {canDeliver && (
                <button
                  onClick={() => setActionModal({ action: 'DELIVER', label: 'Mark Delivered' })}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors rounded shadow-sm"
                >
                  Mark Delivered at Spawn
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => setActionModal({ action: 'COMPLETE', label: 'Confirm Order Completed' })}
                  className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#3FB950] hover:bg-emerald-400 transition-colors rounded shadow-sm"
                >
                  Confirm Completion
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => setActionModal({ action: 'CANCEL', label: 'Cancel Deal' })}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[#F85149] bg-[var(--surface-elevate)] hover:bg-[#F85149]/10 rounded border border-[var(--border)] transition-colors"
                >
                  Cancel Order
                </button>
              )}

              {canDispute && (
                <button
                  onClick={() => setActionModal({ action: 'DISPUTE', label: 'Open Moderator Dispute' })}
                  className="px-3 py-1.5 text-xs font-medium text-[#F85149] bg-[#F85149]/10 hover:bg-[#F85149]/20 rounded border border-[#F85149]/30 transition-colors"
                >
                  Open Dispute
                </button>
              )}

              {canResolveComplete && (
                <button
                  onClick={() => setActionModal({ action: 'RESOLVE_COMPLETE', label: 'Resolve Dispute as Completed' })}
                  className="px-3 py-1.5 text-xs font-semibold text-black bg-[#3FB950] rounded"
                >
                  [MOD] Resolve Complete
                </button>
              )}

              {canResolveCancel && (
                <button
                  onClick={() => setActionModal({ action: 'RESOLVE_CANCEL', label: 'Resolve Dispute as Cancelled' })}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#F85149] rounded"
                >
                  [MOD] Resolve Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vouch Unlock Notice (when status is COMPLETED) */}
        {order.status === 'COMPLETED' && (
          <div className="p-5 rounded-lg border border-[#3FB950]/40 bg-[#3FB950]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3FB950]/20 rounded text-[#3FB950]">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                  Order Successfully Completed & Tracked!
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Both buyer and seller are now unlocked to write a verified vouch with image proof.
                </p>
              </div>
            </div>

            {(() => {
              const userVouch = getVouchForOrder(order.id, currentUser.id);
              if (userVouch) {
                return (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
                    <span className="font-medium text-[var(--text-primary)]">
                      You submitted a {userVouch.rating === 'POSITIVE' ? '+1 Positive' : '-1 Negative'} vouch
                    </span>
                    {userVouch.modStatus === 'NEEDS_REVIEW' && (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Pending Review
                      </span>
                    )}
                  </div>
                );
              }

              if (isBuyer || isSeller) {
                return (
                  <button
                    onClick={() => setIsVouchModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-black bg-[#3FB950] hover:bg-emerald-400 transition-colors rounded shadow-sm shrink-0"
                  >
                    Post Verified Vouch
                  </button>
                );
              }

              return null;
            })()}
          </div>
        )}

        {/* In-Game Payment & Exchange Ledger */}
        <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                In-Game Currency & Delivery Ledger
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Site never moves real money · Server currency only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Buyer Payment Toggle */}
            <div className="p-4 rounded border border-[var(--border)] bg-[var(--surface-elevate)]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  Buyer Payment Confirmation
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    order.buyerPaidInGame ? 'text-[#3FB950]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {order.buyerPaidInGame ? 'CONFIRMED' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Buyer confirms that {formatCurrency(order.agreedPrice)} was transferred in-game to seller.
              </p>
              {isBuyer && (
                <button
                  onClick={() => toggleBuyerPayment(order.id)}
                  className={`w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                    order.buyerPaidInGame
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] font-semibold'
                  }`}
                >
                  {order.buyerPaidInGame ? 'Undo Payment Confirmation' : 'Confirm: I Sent Payment In-Game'}
                </button>
              )}
            </div>

            {/* Seller Receipt Toggle */}
            <div className="p-4 rounded border border-[var(--border)] bg-[var(--surface-elevate)]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  Seller Receipt Confirmation
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    order.sellerReceivedInGame ? 'text-[#3FB950]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {order.sellerReceivedInGame ? 'CONFIRMED' : 'PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Seller verifies that in-game currency was received in their Donut SMP balance.
              </p>
              {isSeller && (
                <button
                  onClick={() => toggleSellerPayment(order.id)}
                  className={`w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                    order.sellerReceivedInGame
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] font-semibold'
                  }`}
                >
                  {order.sellerReceivedInGame ? 'Undo Receipt Confirmation' : 'Confirm: I Received Payment In-Game'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Timeline on Left, Chat & Evidence on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Event Timeline (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <OrderTimeline currentStatus={order.status} events={order.events} />

            {/* Trade Evidence Gallery */}
            <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <h3 className="font-semibold text-xs uppercase font-mono tracking-wider text-[var(--text-muted)]">
                  Trade Evidence & Drop Screenshots ({order.evidenceImages.length + evidenceImages.length})
                </h3>
              </div>

              {/* Upload component for parties to attach drop proof */}
              <ImageUploader
                images={evidenceImages}
                onChange={handleEvidenceUpdate}
                maxCount={4}
                label="Attach Screenshot Proof (Spawn Drop or In-Game Chat)"
                helperText="PNG or JPEG up to 5 MB. EXIF stripped automatically."
              />
            </div>
          </div>

          {/* In-Order Markdown Messaging Thread (6 cols) */}
          <div className="lg:col-span-6">
            <OrderChat
              messages={order.messages}
              onSendMessage={(content) => sendOrderMessage(order.id, content)}
              currentUserId={currentUser.id}
            />
          </div>
        </div>
      </main>

      {/* State Machine Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteAction}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Confirm: {actionModal.label}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                This transition will be permanently recorded in Order #{order.orderNumber}&apos;s timeline.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] block mb-1">
                Optional Timeline Note / Instructions
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                placeholder="e.g. Items dropped in booth 12, ready for collection..."
                className="w-full p-2.5 bg-[var(--surface-elevate)] border border-[var(--border)] focus:border-[var(--accent)] rounded text-xs text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-black bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors rounded shadow-sm"
              >
                Confirm Action
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verified Vouch Submission Modal */}
      {isVouchModalOpen && (
        <VouchModal
          order={order}
          isOpen={isVouchModalOpen}
          onClose={() => setIsVouchModalOpen(false)}
          onSuccess={() => {
            setIsVouchModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

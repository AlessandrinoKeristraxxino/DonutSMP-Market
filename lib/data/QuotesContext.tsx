'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoQuote, DEMO_QUOTES, DemoUser } from './mock-db';
import { useListings } from './ListingsContext';
import { useOrders } from './OrdersContext';
import { scanContent } from '@/lib/moderation/bot';

export interface QuoteWithBuilder extends DemoQuote {
  builder: DemoUser;
}

interface QuotesContextType {
  quotes: DemoQuote[];
  getQuotesForListing: (listingId: string) => QuoteWithBuilder[];
  getUserQuoteForListing: (listingId: string, userId: string) => DemoQuote | undefined;
  submitQuote: (params: {
    listingId: string;
    price: bigint;
    etaDays: number;
    message: string;
  }) => { success: boolean; error?: string; quote?: DemoQuote };
  acceptQuote: (quoteId: string) => { success: boolean; error?: string; orderId?: string };
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

const QUOTES_STORAGE_KEY = 'donut_smp_quotes_v1';

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, users, addAuditLog, listings } = useListings();
  const { createOrder, transitionOrder } = useOrders();

  const [quotes, setQuotes] = useState<DemoQuote[]>(() => {
    if (typeof window === 'undefined') return DEMO_QUOTES;
    try {
      const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((q: any) => ({
          ...q,
          price: BigInt(q.price),
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return DEMO_QUOTES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const serializable = quotes.map((q) => ({
          ...q,
          price: q.price.toString(),
        }));
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(serializable));
      } catch (err) {
        console.error(err);
      }
    }
  }, [quotes]);

  const getQuotesForListing = (listingId: string): QuoteWithBuilder[] => {
    return quotes
      .filter((q) => q.listingId === listingId)
      .map((q) => {
        const builder = users.find((u) => u.id === q.builderId) || {
          id: q.builderId,
          name: 'Unknown Builder',
          minecraftIgn: 'Builder',
          discordId: 'Builder#0000',
          role: 'USER' as const,
          bio: '',
          avatarUrl: 'https://picsum.photos/seed/builder/200/200',
          positiveVouches: 0,
          negativeVouches: 0,
          completedOrders: 0,
          memberSince: '2025',
        };
        return {
          ...q,
          builder,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getUserQuoteForListing = (listingId: string, userId: string): DemoQuote | undefined => {
    return quotes.find((q) => q.listingId === listingId && q.builderId === userId);
  };

  const submitQuote = ({
    listingId,
    price,
    etaDays,
    message,
  }: {
    listingId: string;
    price: bigint;
    etaDays: number;
    message: string;
  }): { success: boolean; error?: string; quote?: DemoQuote } => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) {
      return { success: false, error: 'Listing not found.' };
    }

    if (listing.userId === currentUser.id) {
      return { success: false, error: 'You cannot submit a quote on your own build request.' };
    }

    if (price <= 0n) {
      return { success: false, error: 'Price must be greater than 0.' };
    }

    if (etaDays < 1) {
      return { success: false, error: 'Estimated completion time must be at least 1 day.' };
    }

    if (!message || message.trim().length < 15) {
      return { success: false, error: 'Please provide a proposal message explaining your build plan (min 15 characters).' };
    }

    // Anti-RMT & moderation screening
    const scan = scanContent(message);
    if (scan.decision === 'REJECTED') {
      return {
        success: false,
        error: `Proposal blocked by moderation filter: ${scan.summary}. Real-money trading, external links, and inappropriate text are forbidden.`,
      };
    }

    const newQuote: DemoQuote = {
      id: `quote-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      listingId,
      builderId: currentUser.id,
      price,
      etaDays,
      message: message.trim(),
      isAccepted: false,
      createdAt: new Date().toISOString(),
    };

    setQuotes((prev) => [newQuote, ...prev.filter((q) => !(q.listingId === listingId && q.builderId === currentUser.id))]);

    addAuditLog({
      actorId: currentUser.id,
      action: 'QUOTE_SUBMITTED',
      targetType: 'LISTING',
      targetId: listingId,
      details: `Submitted quote of ${price.toString()} $ (${etaDays} days) for "${listing.title}"`,
    });

    return { success: true, quote: newQuote };
  };

  const acceptQuote = (quoteId: string): { success: boolean; error?: string; orderId?: string } => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) {
      return { success: false, error: 'Quote not found.' };
    }

    const listing = listings.find((l) => l.id === quote.listingId);
    if (!listing) {
      return { success: false, error: 'Associated listing not found.' };
    }

    if (listing.userId !== currentUser.id) {
      return { success: false, error: 'Only the request owner can accept quotes.' };
    }

    // Mark quote accepted
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, isAccepted: true } : q))
    );

    // Create linked verified order
    const builder = users.find((u) => u.id === quote.builderId);
    const newOrder = createOrder({
      type: 'BUILD',
      sellerId: quote.builderId,
      listingId: listing.id,
      agreedPrice: quote.price,
      agreedQuantity: 1,
      itemOrService: `${listing.title} (Quote by ${builder?.minecraftIgn || 'Builder'})`,
      initialMessage: `Client accepted quote proposal. Estimated turnaround: ${quote.etaDays} days. Agreed price: ${quote.price.toString()} $ in-game currency.`,
    });

    // Auto-transition to ACCEPTED since both parties have agreed to the quote
    try {
      transitionOrder(newOrder.id, 'ACCEPT', `Quote #${quote.id.slice(-4)} accepted by client ${currentUser.minecraftIgn}`);
    } catch (e) {
      console.warn('Auto transition note:', e);
    }

    addAuditLog({
      actorId: currentUser.id,
      action: 'QUOTE_ACCEPTED',
      targetType: 'ORDER',
      targetId: newOrder.id,
      details: `Accepted quote #${quote.id} from ${builder?.minecraftIgn || quote.builderId} for Order #${newOrder.orderNumber}`,
    });

    return { success: true, orderId: newOrder.id };
  };

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        getQuotesForListing,
        getUserQuoteForListing,
        submitQuote,
        acceptQuote,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
}

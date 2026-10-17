'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoVouch, DEMO_VOUCHES, DemoUser, DEMO_USERS } from './mock-db';
import { useOrders } from './OrdersContext';
import { useListings } from './ListingsContext';
import { scanContent, ModerationResult } from '@/lib/moderation/bot';

const VOUCHES_STORAGE_KEY = 'donut_smp_vouches_v1';
const AUDIT_STORAGE_KEY = 'donut_smp_audit_logs_v1';

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorIgn: string;
  action: 'APPROVE_VOUCH' | 'REJECT_VOUCH' | 'RESOLVE_DISPUTE' | 'BAN_USER';
  targetType: 'VOUCH' | 'ORDER' | 'USER';
  targetId: string;
  details: string;
  createdAt: string;
}

export interface VouchWithParties extends DemoVouch {
  author: DemoUser;
  target: DemoUser;
}

export interface ModerationQueueItem {
  id: string;
  type: 'VOUCH' | 'REPORT';
  vouchId?: string;
  title: string;
  authorIgn: string;
  authorId: string;
  targetIgn: string;
  targetId: string;
  content: string;
  flagReasons: string[];
  images: string[];
  createdAt: string;
  status: 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';
}

interface VouchesContextType {
  vouches: DemoVouch[];
  auditLogs: AuditLogItem[];
  createVouch: (data: {
    orderId: string;
    rating: 'POSITIVE' | 'NEGATIVE';
    content: string;
    images: string[];
  }) => {
    success: boolean;
    error?: string;
    vouch?: DemoVouch;
    moderationResult?: ModerationResult;
  };
  getVouchesForUser: (userId: string) => VouchWithParties[];
  getVouchesGivenByUser: (userId: string) => VouchWithParties[];
  getVouchForOrder: (orderId: string, authorId: string) => DemoVouch | null;
  getPendingModerationItems: () => ModerationQueueItem[];
  moderateVouch: (
    vouchId: string,
    action: 'APPROVE' | 'REJECT',
    note?: string
  ) => void;
}

const VouchesContext = createContext<VouchesContextType | undefined>(undefined);

// Rich initial seed vouches for demonstration
const INITIAL_VOUCHES: DemoVouch[] = [
  ...DEMO_VOUCHES,
  {
    id: 'vouch-2',
    orderId: 'ord-1040',
    authorId: 'u-1',
    targetId: 'u-3',
    rating: 'POSITIVE',
    content: `## Netherite Mining Rig Built on Schedule
Built an industrial perimeter blast chamber in under 48 hours. Redstone clockwork operates flawlessly without lag spikes. Highly reputable builder on Donut SMP!`,
    modStatus: 'APPROVED',
    images: ['https://picsum.photos/seed/vouchproof2/800/800'],
    createdAt: '2026-10-10T14:20:00Z',
  },
  {
    id: 'vouch-3',
    orderId: 'ord-1039',
    authorId: 'u-3',
    targetId: 'u-1',
    rating: 'POSITIVE',
    content: `## Flawless Spawner Deal
Bought 8 pig spawners. Met at spawn market stall, dropped safely into locked hopper chest. Payment verified in-game via \`/pay\`. Reliable trader.`,
    modStatus: 'APPROVED',
    images: ['https://picsum.photos/seed/vouchproof3/800/800'],
    createdAt: '2026-10-08T09:15:00Z',
  },
  {
    id: 'vouch-4',
    orderId: 'ord-1038',
    authorId: 'u-4',
    targetId: 'u-2',
    rating: 'POSITIVE',
    content: `## Certified Map Frame Alignment
Inspected 3x3 dragon head mosaic. No misaligned item frames, 100% genuine carpet and glass layer rendering. Outstanding artist.`,
    modStatus: 'APPROVED',
    images: ['https://picsum.photos/seed/vouchproof4/800/800'],
    createdAt: '2026-10-05T18:00:00Z',
  },
  {
    id: 'vouch-flagged-demo',
    orderId: 'ord-1037',
    authorId: 'u-1',
    targetId: 'u-3',
    rating: 'POSITIVE',
    content: `Good trade, also check our build portfolio at discord.gg/donutbuilders for 10% off next deal!`,
    modStatus: 'NEEDS_REVIEW',
    images: ['https://picsum.photos/seed/vouchflagged/800/800'],
    createdAt: '2026-10-16T12:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit-1',
    actorId: 'u-4',
    actorIgn: 'Aegis_Guard',
    action: 'APPROVE_VOUCH',
    targetType: 'VOUCH',
    targetId: 'vouch-1',
    details: 'Verified spawn trade screenshot and matching order completion record',
    createdAt: '2026-10-12T13:00:00Z',
  },
];

export function VouchesProvider({ children }: { children: React.ReactNode }) {
  const [vouches, setVouches] = useState<DemoVouch[]>(() => {
    if (typeof window === 'undefined') return INITIAL_VOUCHES;
    try {
      const stored = localStorage.getItem(VOUCHES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_VOUCHES;
    } catch {
      return INITIAL_VOUCHES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOUCHES_STORAGE_KEY, JSON.stringify(vouches));
    }
  }, [vouches]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs));
    }
  }, [auditLogs]);

  const { orders, getOrder } = useOrders();
  const { currentUser, users } = useListings();

  const getVouchForOrder = (orderId: string, authorId: string): DemoVouch | null => {
    return vouches.find((v) => v.orderId === orderId && v.authorId === authorId) || null;
  };

  const createVouch = (data: {
    orderId: string;
    rating: 'POSITIVE' | 'NEGATIVE';
    content: string;
    images: string[];
  }): {
    success: boolean;
    error?: string;
    vouch?: DemoVouch;
    moderationResult?: ModerationResult;
  } => {
    // 1. Order Existence & Status check
    const order = getOrder(data.orderId);
    if (!order) {
      return { success: false, error: 'Referenced order does not exist.' };
    }

    if (order.status !== 'COMPLETED') {
      return {
        success: false,
        error: `Vouches can only be posted after an order is marked COMPLETED (current status: ${order.status}).`,
      };
    }

    // 2. Participant check
    const isBuyer = currentUser.id === order.buyerId;
    const isSeller = currentUser.id === order.sellerId;
    if (!isBuyer && !isSeller) {
      return {
        success: false,
        error: 'Only the verified buyer or seller of this order can write a vouch.',
      };
    }

    const targetId = isBuyer ? order.sellerId : order.buyerId;

    // 3. Duplicate check
    const existing = getVouchForOrder(order.id, currentUser.id);
    if (existing) {
      return {
        success: false,
        error: 'You have already submitted a vouch for this order.',
      };
    }

    // 4. Content length check
    if (data.content.trim().length < 10) {
      return {
        success: false,
        error: 'Vouch description must be at least 10 characters long.',
      };
    }

    // 5. Automated Moderation Bot screening
    const modResult = scanContent(data.content);
    if (modResult.decision === 'REJECTED') {
      return {
        success: false,
        error: modResult.summary,
        moderationResult: modResult,
      };
    }

    const modStatus: 'APPROVED' | 'NEEDS_REVIEW' =
      modResult.decision === 'NEEDS_REVIEW' ? 'NEEDS_REVIEW' : 'APPROVED';

    const newVouch: DemoVouch = {
      id: `vouch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: order.id,
      authorId: currentUser.id,
      targetId,
      rating: data.rating,
      content: data.content,
      modStatus,
      images: data.images.length > 0 ? data.images : [],
      createdAt: new Date().toISOString(),
    };

    setVouches((prev) => [newVouch, ...prev]);

    return {
      success: true,
      vouch: newVouch,
      moderationResult: modResult,
    };
  };

  const getVouchesForUser = (userId: string): VouchWithParties[] => {
    return vouches
      .filter((v) => {
        if (v.targetId !== userId) return false;
        // Show approved vouches to everyone; show pending to author or mods
        if (v.modStatus === 'APPROVED') return true;
        if (currentUser.id === v.authorId || currentUser.role === 'MOD' || currentUser.role === 'ADMIN') {
          return true;
        }
        return false;
      })
      .map((v) => {
        const author = users.find((u) => u.id === v.authorId) || {
          id: v.authorId,
          name: 'Unknown Player',
          minecraftIgn: 'Unknown',
          discordId: 'unknown',
          role: 'USER',
          bio: '',
          avatarUrl: 'https://picsum.photos/seed/unknown/200/200',
          positiveVouches: 0,
          negativeVouches: 0,
          completedOrders: 0,
          memberSince: '2025',
        };
        const target = users.find((u) => u.id === v.targetId) || author;
        return { ...v, author, target };
      });
  };

  const getVouchesGivenByUser = (userId: string): VouchWithParties[] => {
    return vouches
      .filter((v) => v.authorId === userId)
      .map((v) => {
        const author = users.find((u) => u.id === v.authorId) || {
          id: v.authorId,
          name: 'Unknown Player',
          minecraftIgn: 'Unknown',
          discordId: 'unknown',
          role: 'USER',
          bio: '',
          avatarUrl: 'https://picsum.photos/seed/unknown/200/200',
          positiveVouches: 0,
          negativeVouches: 0,
          completedOrders: 0,
          memberSince: '2025',
        };
        const target = users.find((u) => u.id === v.targetId) || author;
        return { ...v, author, target };
      });
  };

  const getPendingModerationItems = (): ModerationQueueItem[] => {
    const flaggedVouches = vouches
      .filter((v) => v.modStatus === 'NEEDS_REVIEW')
      .map((v) => {
        const author = users.find((u) => u.id === v.authorId);
        const target = users.find((u) => u.id === v.targetId);
        const scan = scanContent(v.content);
        return {
          id: `mod-${v.id}`,
          type: 'VOUCH' as const,
          vouchId: v.id,
          title: `Vouch for ${target?.minecraftIgn || 'Player'} (${v.rating === 'POSITIVE' ? '+1' : '-1'})`,
          authorIgn: author?.minecraftIgn || 'Unknown',
          authorId: v.authorId,
          targetIgn: target?.minecraftIgn || 'Unknown',
          targetId: v.targetId,
          content: v.content,
          flagReasons: scan.flags.map((f) => f.message),
          images: v.images,
          createdAt: v.createdAt,
          status: 'NEEDS_REVIEW' as const,
        };
      });

    return flaggedVouches;
  };

  const moderateVouch = (
    vouchId: string,
    action: 'APPROVE' | 'REJECT',
    note?: string
  ) => {
    const vouch = vouches.find((v) => v.id === vouchId);
    if (!vouch) return;

    setVouches((prev) =>
      prev.map((v) => {
        if (v.id === vouchId) {
          return {
            ...v,
            modStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          };
        }
        return v;
      })
    );

    // Record audit log
    const newLog: AuditLogItem = {
      id: `audit-${Date.now().toString(36)}`,
      actorId: currentUser.id,
      actorIgn: currentUser.minecraftIgn,
      action: action === 'APPROVE' ? 'APPROVE_VOUCH' : 'REJECT_VOUCH',
      targetType: 'VOUCH',
      targetId: vouchId,
      details: note || `${action === 'APPROVE' ? 'Approved' : 'Rejected'} flagged vouch`,
      createdAt: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <VouchesContext.Provider
      value={{
        vouches,
        auditLogs,
        createVouch,
        getVouchesForUser,
        getVouchesGivenByUser,
        getVouchForOrder,
        getPendingModerationItems,
        moderateVouch,
      }}
    >
      {children}
    </VouchesContext.Provider>
  );
}

export function useVouches() {
  const context = useContext(VouchesContext);
  if (!context) {
    throw new Error('useVouches must be used within a VouchesProvider');
  }
  return context;
}

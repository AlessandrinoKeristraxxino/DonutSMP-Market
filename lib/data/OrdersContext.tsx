'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DemoOrder,
  DEMO_ORDERS,
  DemoUser,
  DEMO_USERS,
} from './mock-db';
import {
  OrderStatus,
  OrderAction,
  PartyRole,
  canTransition,
  executeTransition,
} from '@/lib/orders/state-machine';
import { useListings } from './ListingsContext';

const ORDERS_STORAGE_KEY = 'donut_smp_orders_v1';

export interface OrderWithParties extends DemoOrder {
  buyer: DemoUser;
  seller: DemoUser;
  evidenceImages: string[];
}

interface OrdersContextType {
  orders: DemoOrder[];
  getOrder: (id: string) => OrderWithParties | null;
  createOrder: (data: {
    type: 'MAP_ART' | 'TRADE' | 'BUILD';
    sellerId: string;
    listingId?: string;
    agreedPrice: bigint;
    agreedQuantity: number;
    itemOrService: string;
    initialMessage?: string;
  }) => DemoOrder;
  transitionOrder: (orderId: string, action: OrderAction, note?: string) => void;
  sendOrderMessage: (orderId: string, content: string) => void;
  toggleBuyerPayment: (orderId: string) => void;
  toggleSellerPayment: (orderId: string) => void;
  addOrderEvidence: (orderId: string, imageUrl: string) => void;
  getUserRoleForOrder: (order: DemoOrder) => PartyRole;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Additional seed orders for realistic testing
const INITIAL_ORDERS: DemoOrder[] = [
  ...DEMO_ORDERS,
  {
    id: 'ord-1042',
    orderNumber: 1042,
    type: 'MAP_ART',
    status: 'IN_PROGRESS',
    buyerId: 'u-1',
    sellerId: 'u-2',
    listingId: 'list-art-2',
    agreedPrice: 800_000n,
    agreedQuantity: 1,
    itemOrService: 'Custom Guild Banner (2×2)',
    buyerPaidInGame: true,
    sellerReceivedInGame: false,
    createdAt: '2026-10-15T15:00:00Z',
    events: [
      {
        id: 'ev-1042-1',
        actorId: 'u-1',
        status: 'REQUESTED',
        note: 'Submitted reference artwork for 2x2 guild banner',
        createdAt: '2026-10-15T15:00:00Z',
      },
      {
        id: 'ev-1042-2',
        actorId: 'u-2',
        status: 'ACCEPTED',
        note: 'Accepted commission, schematic verified',
        createdAt: '2026-10-15T15:30:00Z',
      },
      {
        id: 'ev-1042-3',
        actorId: 'u-2',
        status: 'IN_PROGRESS',
        note: 'Staircase frame leveling begun at sky build platform',
        createdAt: '2026-10-15T16:00:00Z',
      },
    ],
    messages: [
      {
        id: 'msg-1042-1',
        senderId: 'u-1',
        content: 'Please make sure the gold trim uses yellow terracotta rather than raw gold for map contrast.',
        createdAt: '2026-10-15T15:05:00Z',
      },
      {
        id: 'msg-1042-2',
        senderId: 'u-2',
        content: 'Understood! I will use yellow terracotta with birch wood under-layer for 3D staircase depth.',
        createdAt: '2026-10-15T15:35:00Z',
      },
    ],
  },
  {
    id: 'ord-1043',
    orderNumber: 1043,
    type: 'TRADE',
    status: 'REQUESTED',
    buyerId: 'u-4', // Aegis (Mod)
    sellerId: 'u-1', // VoidMiner
    listingId: 'list-mkt-1',
    agreedPrice: 2_500_000n,
    agreedQuantity: 2,
    itemOrService: 'Pig Spawners (x2 Bundle)',
    buyerPaidInGame: false,
    sellerReceivedInGame: false,
    createdAt: '2026-10-16T16:00:00Z',
    events: [
      {
        id: 'ev-1043-1',
        actorId: 'u-4',
        status: 'REQUESTED',
        note: 'Offer sent for 2x Pig Spawners bundle',
        createdAt: '2026-10-16T16:00:00Z',
      },
    ],
    messages: [
      {
        id: 'msg-1043-1',
        senderId: 'u-4',
        content: 'Can meet at spawn booth 4B today after server reboot.',
        createdAt: '2026-10-16T16:01:00Z',
      },
    ],
  },
];

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useListings();
  const [orders, setOrders] = useState<DemoOrder[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ORDERS;
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (!raw) return INITIAL_ORDERS;
      return deserializeOrders(JSON.parse(raw));
    } catch {
      return INITIAL_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(serializeOrders(orders)));
    } catch (err) {
      console.error('Failed to save orders to localStorage', err);
    }
  }, [orders]);

  const getUserRoleForOrder = (order: DemoOrder): PartyRole => {
    if (currentUser.role === 'ADMIN') return 'ADMIN';
    if (currentUser.role === 'MOD') return 'MOD';
    if (currentUser.id === order.sellerId) return 'SELLER';
    if (currentUser.id === order.buyerId) return 'BUYER';
    return 'BUYER'; // fallback
  };

  const getOrder = (id: string): OrderWithParties | null => {
    const ord = orders.find((o) => o.id === id);
    if (!ord) return null;

    const buyer = DEMO_USERS.find((u) => u.id === ord.buyerId) || DEMO_USERS[0];
    const seller = DEMO_USERS.find((u) => u.id === ord.sellerId) || DEMO_USERS[1];
    const evidenceImages = (ord as any).evidenceImages || [];

    return {
      ...ord,
      buyer,
      seller,
      evidenceImages,
    };
  };

  const createOrder = (data: {
    type: 'MAP_ART' | 'TRADE' | 'BUILD';
    sellerId: string;
    listingId?: string;
    agreedPrice: bigint;
    agreedQuantity: number;
    itemOrService: string;
    initialMessage?: string;
  }): DemoOrder => {
    const nextNumber = Math.max(...orders.map((o) => o.orderNumber), 1040) + 1;
    const newId = `ord-${nextNumber}`;
    const now = new Date().toISOString();

    const newOrder: DemoOrder = {
      id: newId,
      orderNumber: nextNumber,
      type: data.type,
      status: 'REQUESTED',
      buyerId: currentUser.id,
      sellerId: data.sellerId,
      listingId: data.listingId,
      agreedPrice: data.agreedPrice,
      agreedQuantity: data.agreedQuantity,
      itemOrService: data.itemOrService,
      buyerPaidInGame: false,
      sellerReceivedInGame: false,
      createdAt: now,
      events: [
        {
          id: `ev-${newId}-1`,
          actorId: currentUser.id,
          status: 'REQUESTED',
          note: `Order #${nextNumber} placed with snapshotted terms`,
          createdAt: now,
        },
      ],
      messages: data.initialMessage
        ? [
            {
              id: `msg-${newId}-1`,
              senderId: currentUser.id,
              content: data.initialMessage,
              createdAt: now,
            },
          ]
        : [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const transitionOrder = (orderId: string, action: OrderAction, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const role = getUserRoleForOrder(ord);
        const nextStatus = executeTransition(ord.status, action, role);
        const now = new Date().toISOString();

        const event = {
          id: `ev-${orderId}-${Date.now().toString(36)}`,
          actorId: currentUser.id,
          status: nextStatus,
          note: note || `Order transitioned to ${nextStatus} by ${currentUser.minecraftIgn}`,
          createdAt: now,
        };

        return {
          ...ord,
          status: nextStatus,
          events: [...ord.events, event],
        };
      })
    );
  };

  const sendOrderMessage = (orderId: string, content: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const msg = {
          id: `msg-${orderId}-${Date.now().toString(36)}`,
          senderId: currentUser.id,
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...ord,
          messages: [...ord.messages, msg],
        };
      })
    );
  };

  const toggleBuyerPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, buyerPaidInGame: !ord.buyerPaidInGame } : ord
      )
    );
  };

  const toggleSellerPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, sellerReceivedInGame: !ord.sellerReceivedInGame } : ord
      )
    );
  };

  const addOrderEvidence = (orderId: string, imageUrl: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const evidence = (ord as any).evidenceImages || [];
        return {
          ...ord,
          evidenceImages: [...evidence, imageUrl],
        };
      })
    );
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        getOrder,
        createOrder,
        transitionOrder,
        sendOrderMessage,
        toggleBuyerPayment,
        toggleSellerPayment,
        addOrderEvidence,
        getUserRoleForOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}

// Serialization helpers
function serializeOrders(orders: DemoOrder[]): any[] {
  return orders.map((o) => ({
    ...o,
    agreedPrice: o.agreedPrice.toString(),
  }));
}

function deserializeOrders(data: any[]): DemoOrder[] {
  return data.map((o) => ({
    ...o,
    agreedPrice: BigInt(o.agreedPrice || '0'),
  }));
}

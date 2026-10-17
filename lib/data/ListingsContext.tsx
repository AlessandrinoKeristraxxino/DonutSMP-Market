'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DemoListing,
  DemoUser,
  DEMO_USERS,
  DemoAuditLog,
  DEMO_AUDIT_LOGS,
} from './mock-db';
import {
  INITIAL_LISTINGS,
  getStoredListings,
  saveStoredListings,
  getListingWithAuthor,
  ListingWithAuthor,
} from './listings-store';
import { CreateListingInput } from '@/lib/validators/listing';

interface ListingsContextType {
  listings: DemoListing[];
  currentUser: DemoUser;
  setCurrentUserId: (id: string) => void;
  users: DemoUser[];
  updateUserProfile: (userId: string, updates: Partial<DemoUser>) => void;
  setUserRole: (userId: string, role: 'USER' | 'MOD' | 'ADMIN') => void;
  toggleUserBan: (userId: string, isBanned: boolean) => void;
  auditLogs: DemoAuditLog[];
  addAuditLog: (log: Omit<DemoAuditLog, 'id' | 'createdAt'>) => void;
  addListing: (input: CreateListingInput) => DemoListing;
  togglePause: (id: string) => void;
  markFulfilled: (id: string) => void;
  deleteListing: (id: string) => void;
  resetToDefaults: () => void;
  getListing: (id: string) => ListingWithAuthor | null;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'donut_smp_current_user_id';
const USERS_STORAGE_KEY = 'donut_smp_users_v2';
const AUDIT_STORAGE_KEY = 'donut_smp_audit_logs_v1';

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<DemoListing[]>(() => getStoredListings());
  
  const [users, setUsers] = useState<DemoUser[]>(() => {
    if (typeof window === 'undefined') return DEMO_USERS;
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return DEMO_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<DemoAuditLog[]>(() => {
    if (typeof window === 'undefined') return DEMO_AUDIT_LOGS;
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return DEMO_AUDIT_LOGS;
  });

  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'u-1';
    try {
      return localStorage.getItem(USER_STORAGE_KEY) || 'u-1';
    } catch {
      return 'u-1';
    }
  });

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USER_STORAGE_KEY, id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    saveStoredListings(listings);
  }, [listings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (err) {
        console.error(err);
      }
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs));
      } catch (err) {
        console.error(err);
      }
    }
  }, [auditLogs]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const updateUserProfile = (userId: string, updates: Partial<DemoUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          ...updates,
        };
      })
    );
  };

  const addAuditLog = (log: Omit<DemoAuditLog, 'id' | 'createdAt'>) => {
    const newLog: DemoAuditLog = {
      ...log,
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setUserRole = (userId: string, role: 'USER' | 'MOD' | 'ADMIN') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    const target = users.find((u) => u.id === userId);
    addAuditLog({
      actorId: currentUser.id,
      action: 'ROLE_UPDATED',
      targetType: 'USER',
      targetId: userId,
      details: `Changed role of ${target?.minecraftIgn || userId} to ${role}`,
    });
  };

  const toggleUserBan = (userId: string, isBanned: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned } : u))
    );
    const target = users.find((u) => u.id === userId);
    addAuditLog({
      actorId: currentUser.id,
      action: isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
      targetType: 'USER',
      targetId: userId,
      details: `${isBanned ? 'Banned' : 'Unbanned'} player ${target?.minecraftIgn || userId}`,
    });
  };

  const addListing = (input: CreateListingInput): DemoListing => {
    const newId = `list-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const newListing: DemoListing = {
      id: newId,
      userId: currentUser.id,
      section: input.section,
      kind: input.kind,
      title: input.title,
      description: input.description,
      price: input.price !== undefined && input.price !== null ? BigInt(input.price) : null,
      isNegotiable: input.isNegotiable,
      isFulfilled: false,
      isPaused: false,
      details: input.details,
      images: input.images.length > 0 ? input.images : ['https://picsum.photos/seed/' + newId + '/800/800'],
      createdAt: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);
    addAuditLog({
      actorId: currentUser.id,
      action: 'LISTING_CREATED',
      targetType: 'LISTING',
      targetId: newId,
      details: `Created ${input.section} listing "${input.title}"`,
    });
    return newListing;
  };

  const togglePause = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isPaused: !l.isPaused } : l))
    );
  };

  const markFulfilled = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFulfilled: !l.isFulfilled } : l))
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const resetToDefaults = () => {
    setListings(INITIAL_LISTINGS);
    saveStoredListings(INITIAL_LISTINGS);
    setUsers(DEMO_USERS);
    setAuditLogs(DEMO_AUDIT_LOGS);
  };

  const getListing = (id: string): ListingWithAuthor | null => {
    const item = listings.find((l) => l.id === id);
    if (!item) return null;
    const author = users.find((u) => u.id === item.userId) || DEMO_USERS[0];
    return {
      ...item,
      author,
    };
  };

  return (
    <ListingsContext.Provider
      value={{
        listings,
        currentUser,
        setCurrentUserId,
        users,
        updateUserProfile,
        setUserRole,
        toggleUserBan,
        auditLogs,
        addAuditLog,
        addListing,
        togglePause,
        markFulfilled,
        deleteListing,
        resetToDefaults,
        getListing,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
}

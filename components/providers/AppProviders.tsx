'use client';

import React from 'react';
import { ListingsProvider } from '@/lib/data/ListingsContext';
import { OrdersProvider } from '@/lib/data/OrdersContext';
import { VouchesProvider } from '@/lib/data/VouchesContext';
import { QuotesProvider } from '@/lib/data/QuotesContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ListingsProvider>
      <OrdersProvider>
        <QuotesProvider>
          <VouchesProvider>{children}</VouchesProvider>
        </QuotesProvider>
      </OrdersProvider>
    </ListingsProvider>
  );
}

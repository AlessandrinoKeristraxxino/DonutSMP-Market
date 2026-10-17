import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Donut SMP Marketplace — In-Game Trading & Reputation Hub',
  description:
    'The dedicated in-game economy hub for Donut SMP players: Map Art gallery and commissions, Buy/Sell trading board, Build services, tracked order state machine, and verified vouch reputation.',
  openGraph: {
    title: 'Donut SMP Marketplace — In-Game Trading & Reputation Hub',
    description:
      'The dedicated in-game economy hub for Donut SMP players: Map Art gallery and commissions, Buy/Sell trading board, Build services, tracked order state machine, and verified vouch reputation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Donut SMP Marketplace — In-Game Trading & Reputation Hub',
    description:
      'The dedicated in-game economy hub for Donut SMP players: Map Art gallery and commissions, Buy/Sell trading board, Build services, tracked order state machine, and verified vouch reputation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] antialiased" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

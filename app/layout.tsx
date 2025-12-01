import type { Metadata } from 'next';
import '@/app/globals.css';
import { Web3Provider } from '@/lib/web3-context';

export const metadata: Metadata = {
  title: 'ArcESC - Instant Payment & Settlement',
  description: 'Secure escrow management system on Arc blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

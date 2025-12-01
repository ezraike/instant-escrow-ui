'use client';

import { useWeb3 } from '@/lib/web3-context';
import { WalletButton } from '@/components/WalletButton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Landing() {
  const { isConnected } = useWeb3();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected) {
      router.push('/app');
    }
  }, [isConnected, mounted, router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center justify-center relative">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 p-6 z-10">
        <a 
          href="/about" 
          className="text-gray-600 hover:text-gray-900 transition font-medium"
        >
          About
        </a>
      </nav>

      {/* Main Content */}
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Logo */}
        <div className="mb-8 animate-bounce">
          <h1 className="text-6xl sm:text-7xl font-bold">
            🔐
          </h1>
        </div>

        {/* Main Heading */}
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
          Build partnerships,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Keep your trust
          </span>
        </h2>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          ArcESC, Instant payment and settlement using Arc blockchain's deterministic finality and USDC gas token technology to provide secure, fast, and low-cost transactions.
        </p>

        {/* Wallet Button - Main CTA */}
        <div className="mb-8 max-w-sm mx-auto">
          <WalletButton />
        </div>

        {/* Features at bottom */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 border-t border-gray-300">
          <div className="text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Sub-Second</h3>
            <p className="text-sm text-gray-600">Instant settlement with deterministic finality</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Stable Fees</h3>
            <p className="text-sm text-gray-600">Predictable USDC-based gas (~$0.01)</p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Secure</h3>
            <p className="text-sm text-gray-600">Enterprise-grade BFT consensus</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-gray-500 text-sm">
          <p>
            Built with ❤️ by{' '}
            <a
              href="https://x.com/ezraike"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ezraike
            </a>
          </p>
          <p className="mt-2">Powered by Arc Network</p>
        </div>
      </div>
    </div>
  );
}

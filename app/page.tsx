import { Web3Provider } from '@/lib/web3-context';
import { WalletButton } from '@/components/WalletButton';
import { CreateEscrowForm } from '@/components/CreateEscrowForm';
import { EscrowList } from '@/components/EscrowList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arc Instant Escrow - Secure Escrow Management',
  description: 'Secure escrow management with deterministic finality on Arc Testnet',
};

export default function Home() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                🔐 Arc Instant Escrow
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Secure Escrow Management with Deterministic Finality
              </p>
            </div>
            <WalletButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900">Fast Transactions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Arc blockchain's sub-second deterministic finality technology
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900">Low Fees</h3>
              <p className="text-sm text-gray-600 mt-1">
                Pay transaction fees with USDC (~0.01 USD)
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900">Secure</h3>
              <p className="text-sm text-gray-600 mt-1">
                Full control and accuracy with smart contracts
              </p>
            </div>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-1">
              <CreateEscrowForm />
            </div>

            {/* Right Column - List */}
            <div className="lg:col-span-2">
              <EscrowList />
            </div>
          </div>

          {/* Network Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Network:</strong> Arc Testnet (Chain ID: 27) | 
              <strong className="ml-4">USDC:</strong> 0x360...000 | 
              <strong className="ml-4">Gas Token:</strong> USDC
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Arc Instant Escrow</h3>
                <p className="text-gray-400 text-sm">
                  Escrow management using Arc blockchain's deterministic finality and USDC gas token technology to provide secure, fast, and low-cost transactions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>
                    <a 
                      href="https://testnet.arcscan.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      Arc Scan (Block Explorer)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://testnet.arc.network" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      Arc Testnet
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://remix.ethereum.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      Remix IDE
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p className="mb-2">
                Built with ❤️ by{' '}
                <a
                  href="https://x.com/ezraike"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition font-semibold"
                >
                  ezraike
                </a>
              </p>
              <p className="mb-4">Powered by Arc Network</p>
              <p className="border-t border-gray-600 pt-4">© 2024 Arc Instant Escrow. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}

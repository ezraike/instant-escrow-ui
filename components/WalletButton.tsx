'use client';

import { useWeb3 } from '@/lib/web3-context';
import { useEffect } from 'react';

export function WalletButton() {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, error } = useWeb3();

  useEffect(() => {
    const handleConnectWallet = () => {
      connectWallet();
    };

    window.addEventListener('connectWallet', handleConnectWallet);
    return () => window.removeEventListener('connectWallet', handleConnectWallet);
  }, [connectWallet]);

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}
      {isConnected ? (
        <div className="space-y-2">
          <div className="p-3 bg-green-100 text-green-800 rounded-lg">
            <p className="font-semibold">Connected ✓</p>
            <p className="text-sm font-mono">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}
    </div>
  );
}

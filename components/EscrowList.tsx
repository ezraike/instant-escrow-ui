'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/lib/web3-context';
import { 
  CONTRACT_ADDRESS, 
  INSTANT_ESCROW_ABI, 
  EscrowStatus
} from '@/lib/contract';
import { EscrowDetail } from './EscrowDetail';

interface Escrow {
  id: string;
  payer: string;
  payee: string;
  amount: string;
  status: number;
  createdAt: number;
  lockTime: number;
  description: string;
  timeRemaining: number;
}

export function EscrowList() {
  const { web3, account, isConnected } = useWeb3();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'payer' | 'payee'>('all');
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && account && web3) {
      loadEscrows();
    }
  }, [isConnected, account, web3]);

  const loadEscrows = async () => {
    try {
      setLoading(true);
      setError('');

      const contract = new web3!.eth.Contract(INSTANT_ESCROW_ABI, CONTRACT_ADDRESS);
      
      const count = await contract.methods.getEscrowCount().call();
      const escrowCount = parseInt(String(count));

      const escrowsData: Escrow[] = [];
      for (let i = 0; i < escrowCount; i++) {
        try {
          const escrowData = (await contract.methods.getEscrow(i).call()) as any[];
          const status = await contract.methods.getEscrowStatus(i).call();
          const timeRemaining = await contract.methods.getTimeRemaining(i).call();

          escrowsData.push({
            id: i.toString(),
            payer: String(escrowData[0]).toLowerCase(),
            payee: String(escrowData[1]).toLowerCase(),
            amount: web3!.utils.fromWei(String(escrowData[2]), 'mwei'),
            status: parseInt(String(status)),
            createdAt: parseInt(String(escrowData[3])),
            lockTime: parseInt(String(escrowData[4])),
            description: String(escrowData[5]),
            timeRemaining: parseInt(String(timeRemaining)),
          });
        } catch (err) {
          console.error(`Error loading escrow ${i}:`, err);
        }
      }

      // Filter escrows based on user role
      let filtered = escrowsData;
      if (filter === 'payer') {
        filtered = escrowsData.filter(e => e.payer === account!.toLowerCase());
      } else if (filter === 'payee') {
        filtered = escrowsData.filter(e => e.payee === account!.toLowerCase());
      }

      setEscrows(filtered.reverse()); // Show newest first
    } catch (err: any) {
      setError(err.message || 'Failed to load escrows');
      console.error('Error loading escrows:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
      [EscrowStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [EscrowStatus.RELEASED]: 'bg-green-100 text-green-800',
      [EscrowStatus.REFUNDED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: number): string => {
    const labels: Record<number, string> = {
      [EscrowStatus.PENDING]: 'Awaiting Arbitration',
      [EscrowStatus.RELEASED]: 'Released',
      [EscrowStatus.REFUNDED]: 'Refunded',
    };
    return labels[status] || 'Unknown';
  };

  const getStatusDescription = (status: number): string => {
    const descriptions: Record<number, string> = {
      [EscrowStatus.PENDING]: '⚖️ Hakem onayı bekleniyor',
      [EscrowStatus.RELEASED]: '✓ Para gönderildi',
      [EscrowStatus.REFUNDED]: '↩️ İade edildi',
    };
    return descriptions[status] || '';
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
        Connect your wallet to view escrows
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Escrows</h2>
          <button
            onClick={loadEscrows}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('payer')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'payer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('payee')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'payee'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Received
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading escrows...</p>
          </div>
        ) : escrows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No escrows found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Counterparty</th>
                  <th className="text-left py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Created</th>
                  <th className="text-left py-2 px-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {escrows.map((escrow) => (
                  <tr 
                    key={escrow.id} 
                    onClick={() => setSelectedEscrowId(escrow.id)}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-2 font-mono text-xs">{escrow.id}</td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-xs">
                        {formatAddress(escrow.payer === account!.toLowerCase() ? escrow.payee : escrow.payer)}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold">{parseFloat(escrow.amount).toFixed(2)} USDC</td>
                    <td className="py-3 px-2">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(escrow.status)}`}>
                          {getStatusLabel(escrow.status)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {getStatusDescription(escrow.status)}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-xs">{formatDate(escrow.createdAt)}</td>
                    <td className="py-3 px-2 text-xs text-gray-600 truncate max-w-[150px]">
                      {escrow.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEscrowId && (
        <EscrowDetail
          escrowId={selectedEscrowId}
          onClose={() => setSelectedEscrowId(null)}
          onUpdate={loadEscrows}
        />
      )}
    </>
  );
}

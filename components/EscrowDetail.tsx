'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3-context';
import { ArbitrationPanel } from './ArbitrationPanel';
import { 
  CONTRACT_ADDRESS, 
  INSTANT_ESCROW_ABI, 
  EscrowStatus,
} from '@/lib/contract';

interface EscrowDetailProps {
  escrowId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function EscrowDetail({ escrowId, onClose, onUpdate }: EscrowDetailProps) {
  const { web3, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [escrow, setEscrow] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userRole, setUserRole] = useState<'payer' | 'payee' | 'none'>('none');
  const [showArbitrationPanel, setShowArbitrationPanel] = useState(false);
  const [isAuthorizedArbitrator, setIsAuthorizedArbitrator] = useState(false);

  useEffect(() => {
    if (isConnected && account && web3) {
      loadEscrowDetails();
      const interval = setInterval(loadEscrowDetails, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [isConnected, account, web3, escrowId]);

  const loadEscrowDetails = async () => {
    try {
      const contract = new web3!.eth.Contract(INSTANT_ESCROW_ABI, CONTRACT_ADDRESS);
      
      const escrowData = (await contract.methods.getEscrow(escrowId).call()) as any[];
      const status = await contract.methods.getEscrowStatus(escrowId).call();
      const remaining = await contract.methods.getTimeRemaining(escrowId).call();

      const payer = String(escrowData[0]).toLowerCase();
      const payee = String(escrowData[1]).toLowerCase();
      const accountLower = account!.toLowerCase();

      let role: 'payer' | 'payee' | 'none' = 'none';
      if (payer === accountLower) role = 'payer';
      else if (payee === accountLower) role = 'payee';

      setEscrow({
        payer,
        payee,
        amount: web3!.utils.fromWei(String(escrowData[2]), 'mwei'),
        status: parseInt(String(status)),
        createdAt: parseInt(String(escrowData[3])),
        lockTime: parseInt(String(escrowData[4])),
        description: String(escrowData[5]),
      });

      setTimeRemaining(parseInt(String(remaining)));
      setUserRole(role);

      // Check if user is authorized arbitrator
      const arbitrationOracleAddress = process.env.NEXT_PUBLIC_ARBITRATION_ORACLE || '';
      if (arbitrationOracleAddress) {
        const arbitrationABI = [
          {
            inputs: [{ internalType: 'address', name: '_arbitrator', type: 'address' }],
            name: 'isAuthorizedArbitrator',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
          },
        ];
        const arbitrationContract = new web3!.eth.Contract(arbitrationABI as any, arbitrationOracleAddress);
        const isArbitrator = await arbitrationContract.methods.isAuthorizedArbitrator(account).call();
        setIsAuthorizedArbitrator(isArbitrator);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load escrow details');
      console.error('Error:', err);
    }
  };

  const handleRelease = async () => {
    if (!web3 || !account) return;

    setLoading(true);
    setError('');

    try {
      const contract = new web3.eth.Contract(INSTANT_ESCROW_ABI, CONTRACT_ADDRESS);
      const tx = contract.methods.releaseEscrow(escrowId);
      const gas = await tx.estimateGas({ from: account });

      await tx.send({
        from: account,
        gas: String(gas),
      });

      await loadEscrowDetails();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to release escrow');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!web3 || !account) return;

    setLoading(true);
    setError('');

    try {
      const contract = new web3.eth.Contract(INSTANT_ESCROW_ABI, CONTRACT_ADDRESS);
      const tx = contract.methods.refundEscrow(escrowId);
      const gas = await tx.estimateGas({ from: account });

      await tx.send({
        from: account,
        gas: String(gas),
      });

      await loadEscrowDetails();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to refund escrow');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusLabel = (status: number): string => {
    const labels: Record<number, string> = {
      [EscrowStatus.PENDING]: 'Pending',
      [EscrowStatus.RELEASED]: 'Released',
      [EscrowStatus.REFUNDED]: 'Refunded',
    };
    return labels[status] || 'Unknown';
  };

  if (!escrow) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold">Escrow #{escrowId}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                escrow.status === EscrowStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                escrow.status === EscrowStatus.RELEASED ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(escrow.status)}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">Escrow Amount</label>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {parseFloat(escrow.amount).toFixed(2)} USDC
            </p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700">Sender</label>
              <p className="mt-1 font-mono text-sm">{formatAddress(escrow.payer)}</p>
              {userRole === 'payer' && <p className="text-xs text-blue-600 mt-1">↳ You</p>}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700">Recipient</label>
              <p className="mt-1 font-mono text-sm">{formatAddress(escrow.payee)}</p>
              {userRole === 'payee' && <p className="text-xs text-blue-600 mt-1">↳ You</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700">Created Date</label>
              <p className="mt-1 text-sm">{formatDate(escrow.createdAt)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700">Lock Duration</label>
              <p className="mt-1 text-sm">{formatDuration(escrow.lockTime)}</p>
            </div>
          </div>

          {/* Time Remaining */}
          {escrow.status === EscrowStatus.PENDING && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-700">Time Until Refund</label>
              <p className="mt-1 text-lg font-bold text-blue-600">
                {timeRemaining > 0 ? formatDuration(timeRemaining) : 'Refund available'}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-700">{escrow.description}</p>
          </div>

          {/* Actions */}
          {escrow.status === EscrowStatus.PENDING && (
            <div className="flex gap-3 pt-4 border-t flex-col">
              <div className="flex gap-3">
                {(userRole === 'payer' || userRole === 'payee') && (
                  <button
                    onClick={handleRelease}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Processing...' : 'Release'}
                  </button>
                )}
                {userRole === 'payer' && timeRemaining <= 0 && (
                  <button
                    onClick={handleRefund}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-semibold"
                  >
                    {loading ? 'Processing...' : 'Refund'}
                  </button>
                )}
              </div>

              {/* Arbitration Panel Button */}
              {isAuthorizedArbitrator && (
                <button
                  onClick={() => setShowArbitrationPanel(!showArbitrationPanel)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  {showArbitrationPanel ? '✕ Hide Arbitration' : '⚖️ Show Arbitration Panel'}
                </button>
              )}
            </div>
          )}

          {/* Arbitration Panel */}
          {isAuthorizedArbitrator && showArbitrationPanel && (
            <div className="border-t pt-4 mt-4">
              <ArbitrationPanel
                escrowId={parseInt(escrowId)}
                onSettled={() => {
                  loadEscrowDetails();
                  onUpdate();
                  setShowArbitrationPanel(false);
                }}
                onDisputed={() => {
                  loadEscrowDetails();
                  onUpdate();
                  setShowArbitrationPanel(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

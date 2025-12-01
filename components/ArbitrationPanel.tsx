'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/lib/web3-context';
import {
  Escrow,
  EscrowStatus,
  Settlement,
  SettlementStatus,
  SettleDisputeInput,
} from '@/lib/types';

interface ArbitrationPanelProps {
  escrowId?: number;
  onSettled?: (escrowId: number) => void;
  onDisputed?: (escrowId: number) => void;
}

export const ArbitrationPanel: React.FC<ArbitrationPanelProps> = ({
  escrowId,
  onSettled,
  onDisputed,
}) => {
  const { web3, account } = useWeb3();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [isSettled, setIsSettled] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Emanet detaylarını yükle
  useEffect(() => {
    if (!escrowId || !web3 || !account) return;

    const loadEscrowDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Escrow sözleşmesinden bilgi al
        const escrowABI = [
          {
            inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
            name: 'getEscrow',
            outputs: [
              {
                components: [
                  { internalType: 'address', name: 'payer', type: 'address' },
                  { internalType: 'address', name: 'payee', type: 'address' },
                  { internalType: 'uint256', name: 'amount', type: 'uint256' },
                  { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                  { internalType: 'enum InstantEscrow.EscrowStatus', name: 'status', type: 'uint8' },
                  { internalType: 'string', name: 'description', type: 'string' },
                ],
                internalType: 'struct InstantEscrow.Escrow',
                name: '',
                type: 'tuple',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ];

        const escrowContractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT || '';
        const escrowContract = new web3.eth.Contract(escrowABI as any, escrowContractAddress);

        const escrowData = await escrowContract.methods.getEscrow(escrowId).call();

        const amountFormatted = web3.utils.fromWei(escrowData.amount, 'mwei');

        setEscrow({
          id: escrowId,
          payer: escrowData.payer,
          payee: escrowData.payee,
          amount: escrowData.amount.toString(),
          amountFormatted,
          deadline: Number(escrowData.deadline),
          deadlineFormatted: new Date(Number(escrowData.deadline) * 1000).toLocaleString(),
          status: escrowData.status,
          description: escrowData.description,
          createdAt: 0,
          timeRemaining: Math.max(0, Number(escrowData.deadline) - Math.floor(Date.now() / 1000)),
          timeRemainingFormatted: '',
        });

        // ArbitrationOracle'dan settlement bilgisini al
        const arbitrationABI = [
          {
            inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
            name: 'getSettlement',
            outputs: [
              {
                components: [
                  { internalType: 'uint256', name: 'escrowId', type: 'uint256' },
                  { internalType: 'address', name: 'arbitrator', type: 'address' },
                  { internalType: 'enum ArbitrationOracle.SettlementStatus', name: 'status', type: 'uint8' },
                  { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
                  { internalType: 'string', name: 'reason', type: 'string' },
                  { internalType: 'bool', name: 'meeTriggered', type: 'bool' },
                ],
                internalType: 'struct ArbitrationOracle.Settlement',
                name: '',
                type: 'tuple',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
            name: 'isSettled',
            outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
            stateMutability: 'view',
            type: 'function',
          },
        ];

        const arbitrationAddress = process.env.NEXT_PUBLIC_ARBITRATION_ORACLE || '';
        const arbitrationContract = new web3.eth.Contract(arbitrationABI as any, arbitrationAddress);

        const settlementData = await arbitrationContract.methods.getSettlement(escrowId).call();
        const isSettledValue = await arbitrationContract.methods.isSettled(escrowId).call();

        setSettlement({
          escrowId: Number(settlementData.escrowId),
          arbitrator: settlementData.arbitrator,
          status: settlementData.status,
          timestamp: Number(settlementData.timestamp),
          timestampFormatted: new Date(Number(settlementData.timestamp) * 1000).toLocaleString(),
          reason: settlementData.reason,
          meeTriggered: settlementData.meeTriggered,
        });

        setIsSettled(isSettledValue);
      } catch (err: any) {
        setError(err.message || 'Failed to load escrow details');
        console.error('Error loading escrow details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEscrowDetails();
  }, [escrowId, web3, account]);

  // Hizmeti tamamlandı olarak işaretle
  const handleSettle = async () => {
    if (!escrowId || !web3 || !account || !reason.trim()) {
      setError('Please provide a reason for settlement');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const arbitrationABI = [
        {
          inputs: [
            { internalType: 'uint256', name: '_escrowId', type: 'uint256' },
            { internalType: 'string', name: '_reason', type: 'string' },
          ],
          name: 'settleDispute',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ];

      const arbitrationAddress = process.env.NEXT_PUBLIC_ARBITRATION_ORACLE || '';
      const arbitrationContract = new web3.eth.Contract(arbitrationABI as any, arbitrationAddress);

      const tx = await arbitrationContract.methods.settleDispute(escrowId, reason).send({
        from: account,
      });

      setSuccess(`Settlement confirmed! TX: ${tx.transactionHash}`);
      setReason('');
      setIsSettled(true);

      if (onSettled) {
        onSettled(escrowId);
      }

      // Sayfayı yenile
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to settle dispute');
      console.error('Error settling dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  // Anlaşmazlık olarak işaretle
  const handleDispute = async () => {
    if (!escrowId || !web3 || !account || !reason.trim()) {
      setError('Please provide a reason for dispute');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const arbitrationABI = [
        {
          inputs: [
            { internalType: 'uint256', name: '_escrowId', type: 'uint256' },
            { internalType: 'string', name: '_reason', type: 'string' },
          ],
          name: 'markAsDisputed',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ];

      const arbitrationAddress = process.env.NEXT_PUBLIC_ARBITRATION_ORACLE || '';
      const arbitrationContract = new web3.eth.Contract(arbitrationABI as any, arbitrationAddress);

      const tx = await arbitrationContract.methods.markAsDisputed(escrowId, reason).send({
        from: account,
      });

      setSuccess(`Dispute marked! TX: ${tx.transactionHash}`);
      setReason('');
      setIsSettled(false);

      if (onDisputed) {
        onDisputed(escrowId);
      }

      // Sayfayı yenile
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark dispute');
      console.error('Error marking dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!escrowId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No escrow selected</p>
      </div>
    );
  }

  if (loading && !escrow) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-800">Loading arbitration details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">⚖️ Arbitration Panel</h3>

      {escrow && (
        <div className="space-y-4">
          {/* Emanet Bilgisi */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Escrow Details</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">From:</span>
                <span className="font-mono ml-2">{escrow.payer.substring(0, 10)}...</span>
              </p>
              <p>
                <span className="text-gray-600">To:</span>
                <span className="font-mono ml-2">{escrow.payee.substring(0, 10)}...</span>
              </p>
              <p>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-semibold">{escrow.amountFormatted} USDC</span>
              </p>
              <p>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2">
                  {escrow.status === EscrowStatus.PENDING && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PENDING</span>
                  )}
                  {escrow.status === EscrowStatus.RELEASED && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">RELEASED</span>
                  )}
                  {escrow.status === EscrowStatus.REFUNDED && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">REFUNDED</span>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Settlement Durumu */}
          {settlement && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Settlement Status</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Current Status:</span>
                  <span className="ml-2">
                    {settlement.status === SettlementStatus.PENDING && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PENDING</span>
                    )}
                    {settlement.status === SettlementStatus.SETTLED && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">SETTLED</span>
                    )}
                    {settlement.status === SettlementStatus.DISPUTED && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DISPUTED</span>
                    )}
                    {settlement.status === SettlementStatus.CANCELLED && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">CANCELLED</span>
                    )}
                  </span>
                </p>
                {settlement.reason && (
                  <p>
                    <span className="text-gray-600">Reason:</span>
                    <span className="ml-2">{settlement.reason}</span>
                  </p>
                )}
                {settlement.meeTriggered && (
                  <p className="text-green-600">✓ MEE triggered automatic release</p>
                )}
              </div>
            </div>
          )}

          {/* Hakem Karar Formu */}
          {escrow.status === EscrowStatus.PENDING && settlement?.status !== SettlementStatus.DISPUTED && (
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Settlement Reason / Notes
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why the service was completed or why there's a dispute..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                disabled={loading}
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSettle}
                  disabled={loading || !reason.trim() || isSettled}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Processing...' : '✓ Approve & Settle'}
                </button>
                <button
                  onClick={handleDispute}
                  disabled={loading || !reason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? 'Processing...' : '✗ Mark as Disputed'}
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">⚠️ {error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">✓ {success}</p>
            </div>
          )}

          {/* MEE Information */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
            <p className="text-purple-900">
              <strong>💜 MEE Integration:</strong> When you approve this settlement, the MEE will automatically
              trigger the escrow release with Arc's sub-second finality.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

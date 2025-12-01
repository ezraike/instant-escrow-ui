'use client';

import { useState } from 'react';
import { useWeb3 } from '@/lib/web3-context';
import { CONTRACT_ADDRESS, INSTANT_ESCROW_ABI, USDC_ADDRESS, USDC_ABI } from '@/lib/contract';

export function CreateEscrowForm() {
  const { web3, account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    payee: '',
    amount: '',
    lockTime: '86400', // 1 day default
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!web3 || !account || !isConnected) {
      setError('Cüzdan bağlı değil');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate inputs
      if (!formData.payee || !formData.amount || !formData.description) {
        throw new Error('Lütfen tüm alanları doldurunuz');
      }

      if (!web3.utils.isAddress(formData.payee)) {
        throw new Error('Geçersiz alıcı adresi');
      }

      // Convert amount to Wei (USDC has 6 decimals, not 18)
      const amountWei = web3.utils.toWei(formData.amount, 'mwei');
      const lockTimeSeconds = parseInt(formData.lockTime);

      if (lockTimeSeconds < 3600 || lockTimeSeconds > 31536000) {
        throw new Error('Kilit süresi 1 saat ile 365 gün arasında olmalıdır');
      }

      // First, check current USDC balance
      console.log('Checking USDC balance...');
      const usdcContract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
      
      try {
        const balance = await usdcContract.methods.balanceOf(account).call();
        const balanceStr = String(balance);
        // USDC has 6 decimals
        const balanceAmount = web3.utils.fromWei(balanceStr, 'mwei');
        console.log('USDC Balance:', balanceAmount);
        
        if (BigInt(balanceStr) < BigInt(amountWei)) {
          throw new Error(`Yetersiz USDC bakiyesi. Bakiye: ${balanceAmount}, Gerekli: ${formData.amount}`);
        }
      } catch (balanceErr: any) {
        console.error('Balance check error:', balanceErr);
        throw new Error(`USDC bakiye kontrol başarısız: ${balanceErr.message}`);
      }

      // Approve USDC with a very high amount (infinite approval)
      console.log('Approving USDC...');
      const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // 2^256 - 1
      
      try {
        const approveTx = usdcContract.methods.approve(CONTRACT_ADDRESS, maxUint256);
        const fixedGas = '150000';
        
        const approveTxResult = await approveTx.send({
          from: account,
          gas: fixedGas,
        });

        console.log('USDC approved:', approveTxResult);
        
        // Verify approval was successful
        const allowance = await usdcContract.methods.allowance(account, CONTRACT_ADDRESS).call();
        console.log('Verified allowance:', allowance);
        
        if (BigInt(String(allowance)) < BigInt(amountWei)) {
          throw new Error('Approval verification failed - allowance insufficient');
        }
      } catch (approveErr: any) {
        console.error('Approval error:', approveErr);
        throw new Error(`USDC onayı başarısız: ${approveErr.message || String(approveErr)}`);
      }

      // Delay to ensure approval is confirmed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Then, create escrow
      console.log('Creating escrow...');
      const escrowContract = new web3.eth.Contract(INSTANT_ESCROW_ABI, CONTRACT_ADDRESS);
      
      try {
        const createTx = escrowContract.methods.createEscrow(
          formData.payee.toLowerCase(),
          amountWei,
          lockTimeSeconds,
          formData.description
        );

        // Try to estimate gas first
        let fixedGas = '500000'; // Conservative default
        try {
          const estimated = await createTx.estimateGas({ from: account });
          fixedGas = String(BigInt(estimated) * BigInt(150) / BigInt(100)); // 150% buffer
          console.log('Estimated gas:', estimated, '-> Using:', fixedGas);
        } catch (estErr) {
          console.warn('Gas estimation failed, using default:', fixedGas);
        }
        
        const receipt = await createTx.send({
          from: account,
          gas: fixedGas,
        });

        console.log('Escrow created:', receipt);
        setSuccess(true);
      } catch (createErr: any) {
        console.error('Create escrow error:', createErr);
        throw new Error(`Emanet oluşturma başarısız: ${createErr.message || String(createErr)}`);
      }

      setFormData({ payee: '', amount: '', lockTime: '86400', description: '' });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'İşlem başarısız');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
        Emanet oluşturmak için cüzdanı bağlayınız
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Yeni Emanet Oluştur</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-800 rounded-lg text-sm">
          ✓ Emanet başarıyla oluşturuldu!
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">Alıcı Adresi *</label>
        <input
          type="text"
          name="payee"
          value={formData.payee}
          onChange={handleInputChange}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">USDC Miktarı *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Kilit Süresi (Saniye) *</label>
        <select
          name="lockTime"
          value={formData.lockTime}
          onChange={(e) => setFormData(prev => ({ ...prev, lockTime: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="3600">1 Saat</option>
          <option value="86400">1 Gün</option>
          <option value="604800">1 Hafta</option>
          <option value="2592000">30 Gün</option>
          <option value="31536000">1 Yıl</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Açıklama *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Emanet hakkında açıklama yazınız..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
      >
        {loading ? 'İşlem Yapılıyor...' : 'Emanet Oluştur'}
      </button>
    </form>
  );
}

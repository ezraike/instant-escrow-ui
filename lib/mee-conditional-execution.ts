/**
 * MEE Conditional Execution Helper
 * Biconomy MEE ile koşullu yürütme entegrasyonu
 * 
 * isSettled() = true olduğunda otomatik releaseEscrow() çağrısı
 */

import { Web3 } from 'web3';
import { MEECondition } from './types';

/**
 * MEE koşulu oluşturur
 * 
 * Bu koşul, emanet serbest bırakılmadan önce ArbitrationOracle.isSettled() kontrolü yapar.
 * isSettled() true döndürünce, MEE releaseEscrow() işlemini otomatik çağırır.
 * 
 * @param escrowId Emanet ID'si
 * @param arbitrationOracleAddress ArbitrationOracle kontrat adresi
 * @returns MEE koşulu
 */
export function createMEESettlementCondition(
  escrowId: number,
  arbitrationOracleAddress: string
): MEECondition {
  return {
    type: 'arbitration',
    escrowId,
    contractAddress: arbitrationOracleAddress,
    functionName: 'isSettled',
    expectedValue: true,
  };
}

/**
 * Conditional Release Instruction oluşturur
 * 
 * Bu instruction, Biconomy MEE'ye şöyle söyler:
 * "releaseEscrow() işlemini yalnızca ArbitrationOracle.isSettled() = true olduğunda yap"
 * 
 * @param escrowId Emanet ID'si
 * @param escrowContractAddress SimpleEscrow kontrat adresi
 * @param arbitrationOracleAddress ArbitrationOracle kontrat adresi
 * @param web3 Web3 instance
 * @returns MEE instruction payload
 */
export async function buildConditionalReleaseInstruction(
  escrowId: number,
  escrowContractAddress: string,
  arbitrationOracleAddress: string,
  web3: Web3
) {
  // SimpleEscrow releaseEscrow() ABI
  const releaseABI = [
    {
      inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
      name: 'releaseEscrow',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  // ArbitrationOracle isSettled() ABI
  const conditionABI = [
    {
      inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
      name: 'isSettled',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // Koşul: ArbitrationOracle.isSettled(escrowId) == true
  const condition = {
    targetContract: arbitrationOracleAddress,
    functionAbi: conditionABI,
    functionName: 'isSettled',
    args: [escrowId],
    value: true,
    type: 'eq',
    description: `Wait for arbitration settlement on escrow ${escrowId}`,
  };

  // Ana işlem: SimpleEscrow.releaseEscrow(escrowId)
  const instruction = {
    type: 'default',
    data: {
      to: escrowContractAddress,
      abi: releaseABI,
      functionName: 'releaseEscrow',
      args: [escrowId],
      chainId: 27, // Arc Testnet
      conditions: [condition],
    },
  };

  return instruction;
}

/**
 * Biconomy MEE ile emanet serbest bırakma (koşullu)
 * 
 * Akış:
 * 1. Hakem ArbitrationOracle.settleDispute() çağırır
 * 2. isSettled(escrowId) = true olur
 * 3. MEE bu koşulu tespit eder ve releaseEscrow() otomatik çağırır
 * 4. Arc'ın sub-second finality ile hemen kesinleşir
 * 
 * @param escrowId Emanet ID'si
 * @param escrowContractAddress SimpleEscrow kontrat adresi
 * @param arbitrationOracleAddress ArbitrationOracle kontrat adresi
 * @param userAccount Kullanıcı adresi
 * @param web3 Web3 instance
 * @returns MEE execute payload
 */
export async function buildMEEConditionalReleasePayload(
  escrowId: number,
  escrowContractAddress: string,
  arbitrationOracleAddress: string,
  userAccount: string,
  web3: Web3
) {
  const instruction = await buildConditionalReleaseInstruction(
    escrowId,
    escrowContractAddress,
    arbitrationOracleAddress,
    web3
  );

  // MEE Supertransaction Payload
  const payload = {
    mode: 'smart-account',
    ownerAddress: userAccount,
    composeFlows: [
      {
        type: '/instructions/default',
        data: instruction.data,
      },
    ],
    feeToken: {
      chainId: 27, // Arc Testnet
      tokenAddress: '0x3600000000000000000000000000000000000000', // USDC
    },
  };

  return payload;
}

/**
 * MEE Caching Mekanizması
 * 
 * ArbitrationOracle'da isSettledCache hızlı sorgulamalar için kırpılır
 * 
 * @param escrowId Emanet ID'si
 * @param arbitrationOracleAddress ArbitrationOracle kontrat adresi
 * @param web3 Web3 instance
 * @param userAccount Kullanıcı adresi
 */
export async function updateMEESettlementCache(
  escrowId: number,
  arbitrationOracleAddress: string,
  web3: Web3,
  userAccount: string
) {
  const ABI = [
    {
      inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
      name: 'updateSettledCache',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const contract = new web3.eth.Contract(ABI as any, arbitrationOracleAddress);

  try {
    const tx = await contract.methods.updateSettledCache(escrowId).send({
      from: userAccount,
    });
    return tx.transactionHash;
  } catch (error) {
    console.error('Error updating MEE cache:', error);
    throw error;
  }
}

/**
 * Manual Release (MEE olmadan)
 * 
 * Eğer MEE entegrasyonu aktif değilse, kullanıcı doğrudan release yapabilir
 * 
 * @param escrowId Emanet ID'si
 * @param escrowContractAddress SimpleEscrow kontrat adresi
 * @param web3 Web3 instance
 * @param userAccount Kullanıcı adresi
 */
export async function manualReleaseEscrow(
  escrowId: number,
  escrowContractAddress: string,
  web3: Web3,
  userAccount: string
) {
  const ABI = [
    {
      inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
      name: 'releaseEscrow',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const contract = new web3.eth.Contract(ABI as any, escrowContractAddress);

  try {
    const tx = await contract.methods.releaseEscrow(escrowId).send({
      from: userAccount,
    });
    return tx.transactionHash;
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
}

/**
 * Emanet durumunu kontrol eder (hakem onayı gerektirip gerektirmediğini)
 * 
 * @param escrowId Emanet ID'si
 * @param escrowContractAddress SimpleEscrow kontrat adresi
 * @param web3 Web3 instance
 */
export async function canReleaseWithArbitration(
  escrowId: number,
  escrowContractAddress: string,
  web3: Web3
): Promise<boolean> {
  const ABI = [
    {
      inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
      name: 'canReleaseWithArbitration',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new web3.eth.Contract(ABI as any, escrowContractAddress);

  try {
    const result = await contract.methods.canReleaseWithArbitration(escrowId).call();
    return result;
  } catch (error) {
    console.error('Error checking release eligibility:', error);
    return false;
  }
}

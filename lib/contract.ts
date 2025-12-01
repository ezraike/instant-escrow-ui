// Contract Configuration
export const ARC_TESTNET_CONFIG = {
  chainId: 27,
  chainName: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  blockExplorerUrl: 'https://testnet.arcscan.app',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
};

// Contract Addresses (Update with your deployed address)
export const CONTRACT_ADDRESS = '0xB3aC493E019Ed51794bC00B60c830aaEeF22814d'; // Deployed on Arc Testnet
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';

// InstantEscrow ABI
export const INSTANT_ESCROW_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_usdc', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'payee', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'description', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'EscrowCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'payee', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'EscrowReleased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'escrowId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'payer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'payee', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'EscrowRefunded',
    type: 'event',
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getEscrowCount',
    inputs: [],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'createEscrow',
    inputs: [
      { internalType: 'address', name: '_payee', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'uint256', name: '_lockTime', type: 'uint256' },
      { internalType: 'string', name: '_description', type: 'string' },
    ],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'releaseEscrow',
    inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'refundEscrow',
    inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getEscrow',
    inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
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
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getEscrowStatus',
    inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
    outputs: [{ internalType: 'enum InstantEscrow.EscrowStatus', name: '', type: 'uint8' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'getTimeRemaining',
    inputs: [{ internalType: 'uint256', name: '_escrowId', type: 'uint256' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
];

// USDC ABI (ERC20)
export const USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export enum EscrowStatus {
  PENDING = 0,
  RELEASED = 1,
  REFUNDED = 2,
}

export const STATUS_LABELS = {
  [EscrowStatus.PENDING]: 'Beklemede',
  [EscrowStatus.RELEASED]: 'Serbest Bırakıldı',
  [EscrowStatus.REFUNDED]: 'İade Edildi',
};

export const STATUS_COLORS = {
  [EscrowStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [EscrowStatus.RELEASED]: 'bg-green-100 text-green-800',
  [EscrowStatus.REFUNDED]: 'bg-blue-100 text-blue-800',
};

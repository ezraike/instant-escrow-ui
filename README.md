# Arc Instant Escrow - Web UI

Modern web interface for managing USDC-based escrows on Arc Testnet with deterministic finality.

## 🚀 Features

- **Connect Wallet**: MetaMask integration for Arc Testnet (Chain ID: 27)
- **Create Escrows**: Send USDC with configurable time-locks (1 hour - 365 days)
- **Manage Escrows**: View, release, or refund escrows with real-time status tracking
- **Filter & Search**: Filter by sent/received escrows with instant refresh
- **Click-to-Details**: View full escrow information in modal dialogs
- **Real-time Updates**: Auto-refresh escrow list every 10 seconds
- **Turkish Localization**: Full Turkish language support

## 📋 Project Structure

```
instant-escrow-ui/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global Tailwind styles
├── components/
│   ├── WalletButton.tsx    # Wallet connection/disconnection
│   ├── CreateEscrowForm.tsx # Form for creating new escrows
│   ├── EscrowList.tsx      # List of all escrows with filters
│   └── EscrowDetail.tsx    # Modal for escrow details & actions
├── lib/
│   ├── contract.ts         # Contract ABI & configuration
│   ├── web3-context.tsx    # Web3 provider & useWeb3 hook
├── public/                 # Static assets
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── next.config.js          # Next.js configuration
└── postcss.config.js       # PostCSS configuration
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js v20+ (tested with v24.11.1)
- npm v11+
- MetaMask browser extension

### Installation

```bash
cd instant-escrow-ui
npm install
```

### Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🌐 Network Configuration

**Arc Testnet**
- Chain ID: `27` (hex: `0x1b`)
- RPC URL: `https://rpc.testnet.arc.network`
- Block Explorer: `https://testnet.arcscan.app`
- Gas Token: USDC (0x3600000000000000000000000000000000000000)

### Add Arc Testnet to MetaMask

1. Open MetaMask → Settings → Networks → Add Network
2. Configure:
   - Network Name: Arc Testnet
   - RPC URL: https://rpc.testnet.arc.network
   - Chain ID: 27
   - Currency: USDC
   - Block Explorer: https://testnet.arcscan.app

## 📱 Components

### WalletButton
Displays wallet connection status and allows connect/disconnect.

```tsx
import { WalletButton } from '@/components/WalletButton';
<WalletButton />
```

### CreateEscrowForm
Form for creating new escrows with USDC amount, recipient, lock time, and description.

```tsx
import { CreateEscrowForm } from '@/components/CreateEscrowForm';
<CreateEscrowForm />
```

### EscrowList
Displays all escrows with filtering (All, Sent, Received) and click-to-view functionality.

```tsx
import { EscrowList } from '@/components/EscrowList';
<EscrowList />
```

### EscrowDetail
Modal dialog showing full escrow details with release/refund actions.

```tsx
import { EscrowDetail } from '@/components/EscrowDetail';
<EscrowDetail 
  escrowId="0" 
  onClose={() => setOpen(false)} 
  onUpdate={() => refresh()}
/>
```

## 🔐 Web3 Integration

The app uses a React Context API for Web3 state management:

```tsx
import { useWeb3 } from '@/lib/web3-context';

function MyComponent() {
  const { web3, account, isConnected } = useWeb3();
  // Use Web3 instance and account
}
```

### Web3Context Features
- ✅ MetaMask detection and connection
- ✅ Automatic Arc Testnet chain switching
- ✅ Account change listener
- ✅ Error handling and state management
- ✅ Global state access via useWeb3() hook

## 🎨 Styling

- **Framework**: Tailwind CSS v3.3
- **Animations**: Custom fade-in and slide-up animations
- **Dark Mode**: Configured (can be enabled in tailwind.config.js)
- **Responsive**: Mobile-first design with Tailwind breakpoints

## 📦 Dependencies

### Runtime
- `react` - UI library
- `react-dom` - DOM renderer
- `next` - React framework
- `web3` - Blockchain interaction
- `ethers` - Alternative Web3 library

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes
- `eslint` - Code linting

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔑 Smart Contract

**Contract Address** (Update in `lib/contract.ts`):
```typescript
export const CONTRACT_ADDRESS = '0x...'; // Your deployed address
```

**ABI Functions**:
- `createEscrow(payee, amount, lockTime, description)` - Create escrow
- `releaseEscrow(escrowId)` - Release to payee
- `refundEscrow(escrowId)` - Refund to payer (after lock time)
- `getEscrow(id)` - Get escrow details
- `getEscrowCount()` - Get total escrow count
- `getEscrowStatus(id)` - Get escrow status

## 🛠️ Development Tips

### TypeScript Strict Mode
The project uses TypeScript strict mode for type safety.

### Module Path Aliases
Use `@/*` for imports:
```tsx
import { useWeb3 } from '@/lib/web3-context';
import { CreateEscrowForm } from '@/components/CreateEscrowForm';
```

### Hot Module Reloading
Next.js provides instant refresh on file changes (Fast Refresh).

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=27
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
```

## 📝 Usage Workflow

1. **Connect Wallet**
   - Click "Cüzdanı Bağla" button
   - Approve MetaMask connection
   - Automatically switches to Arc Testnet

2. **Create Escrow**
   - Fill form with recipient address, USDC amount, duration
   - Click "Emanet Oluştur"
   - Approve USDC spending in MetaMask
   - Confirm escrow creation

3. **View Escrows**
   - All escrows display in table
   - Filter by "Tümü", "Gönderdiklerim", "Aldıklarım"
   - Click row to view details

4. **Manage Escrow**
   - Click escrow row to open modal
   - View full details and timeline
   - Release or refund as applicable

## ⚠️ Important Notes

- **Gas Fees**: Arc charges fees in USDC (~0.01 USD per transaction)
- **Deterministic Finality**: Transactions finalize instantly on Arc
- **Time-locks**: Minimum 1 hour, maximum 365 days
- **Security**: Smart contract audited and tested

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed
- Check Arc Testnet is added to MetaMask
- Clear browser cache and restart

### Contract Address Not Found
- Update `CONTRACT_ADDRESS` in `lib/contract.ts` with deployed address
- Verify address is on Arc Testnet

### Escrow Not Appearing
- Click "Yenile" button to refresh
- Check account address matches
- Verify transaction was confirmed on block explorer

## 📞 Support

For issues or questions:
1. Check the [Arc Documentation](https://arc.network)
2. Review smart contract [on Remix IDE](https://remix.ethereum.org)
3. Check block explorer at [https://testnet.arcscan.app](https://testnet.arcscan.app)

## 📄 License

MIT License - See LICENSE file for details

---

**Happy Escrow Management! 🎉**

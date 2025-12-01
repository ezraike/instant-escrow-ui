# Arc Instant Escrow - Development Guide

## 🔗 Chat History Reference
**Important**: Save this link to remember the entire development process:
- **Full Chat History**: This conversation contains all technical decisions, bug fixes, and development progress
- When returning to development, reference this chat and the commits below for context

## Project Status (as of Dec 1, 2025)

### ✅ Completed
- Smart contract deployed on Arc Testnet (0xB3aC493E019Ed51794bC00B60c830aaEeF22814d)
- Full web UI with React components
- USDC integration (6 decimals - CRITICAL: uses 'mwei' not 'ether')
- Approval verification for safer transactions
- 100% English internationalization
- Footer with creator attribution
- Vercel production deployment

### 🔧 Tech Stack
- Smart Contract: Solidity ^0.8.30 on Arc Testnet (Chain ID: 27)
- Frontend: Next.js 15.5.6 + TypeScript 5.3 + Tailwind CSS
- Web3: Web3.js 4.1 with MetaMask integration
- Deployment: Vercel (https://instant-escrow-ui.vercel.app)
- GitHub Repository: https://github.com/ezraike/instant-escrow-ui

### 🎯 Key Technical Discoveries

#### 1. **USDC Decimals** (CRITICAL!)
Arc USDC uses 6 decimals, NOT Ethereum's 18
- Correct: `web3.utils.toWei(amount, 'mwei')` / `web3.utils.fromWei(balance, 'mwei')`
- Wrong: `web3.utils.toWei(amount, 'ether')` (causes 10^12x calculation errors)
- Files affected: EscrowList.tsx (line 49), EscrowDetail.tsx (line 49)

#### 2. **Approval Verification**
Must verify USDC allowance before creating escrow
- Location: CreateEscrowForm.tsx lines 90-93
- Prevents "Transaction has been reverted by the EVM" errors
- Flow: User approves → Verify allowance → Create escrow

#### 3. **Network Configuration**
- Network: Arc Testnet (Chain ID: 27)
- RPC URL: https://rpc.testnet.arc.network
- USDC Address: 0x3600000000000000000000000000000000000000
- Contract Address: 0xB3aC493E019Ed51794bC00B60c830aaEeF22814d

### 📁 Project Structure
```
instant-escrow-ui/
├── app/
│   ├── page.tsx           # Main page with hero, features, form & list
│   ├── layout.tsx         # Layout with metadata & language
│   └── globals.css        # Tailwind styling
├── components/
│   ├── WalletButton.tsx      # MetaMask connection/disconnect
│   ├── CreateEscrowForm.tsx  # Escrow creation with USDC approval
│   ├── EscrowList.tsx        # Escrow list with filters (all/sent/received)
│   └── EscrowDetail.tsx      # Escrow details modal with actions
├── lib/
│   ├── web3-context.tsx    # Web3 provider (MetaMask + Arc Testnet)
│   └── contract.ts         # Contract configuration & ABI
├── public/                 # Static assets
├── DEVELOPMENT.md          # This file
└── package.json
```

### 🗣️ Internationalization
**Status**: 100% English (previously Turkish)

Translated sections:
- All UI component labels and buttons
- Form validation error messages
- Status labels (Pending, Released, Refunded)
- Footer section headers and descriptions
- Marketing/hero section text
- Wallet connection messages
- Metadata (title, description, language attribute)

### 📝 Recent Commits (Chronological)
```
d009df1f - fix: use correct USDC decimal (mwei) for amount conversion
d041f864 - fix: add approval verification before escrow creation
e484fe20 - feat: internationalize UI to English
7ea3efb8 - feat: translate marketing content and metadata to English
d7528e37 - feat: add creator attribution and Arc Network credit in footer
76e5f488 - fix: translate remaining Turkish text to English in footer and form
```

### 🚀 Future Development Ideas

#### Phase 2: Enhanced Features
- [ ] Escrow history and analytics dashboard
- [ ] Transaction history with export (CSV/JSON)
- [ ] Email/webhook notifications on escrow events
- [ ] Advanced search and filtering by date/amount/address

#### Phase 3: Multi-Token Support
- [ ] Support additional ERC20 tokens beyond USDC
- [ ] Dynamic token selector with price feeds
- [ ] Token balance display for connected wallet

#### Phase 4: Advanced Escrow Conditions
- [ ] Milestone-based escrow releases
- [ ] Multi-signature approval
- [ ] Dispute resolution system with arbitration
- [ ] Escrow templates for common use cases

#### Phase 5: Mobile & UX
- [ ] Mobile-responsive improvements
- [ ] React Native mobile app
- [ ] Dark mode toggle
- [ ] Internationalization (i18n) support for multiple languages

#### Phase 6: Integration & Infrastructure
- [ ] GraphQL subgraph for efficient data queries
- [ ] Off-chain event indexing
- [ ] API endpoint for third-party integration
- [ ] Web3 wallet alternatives (WalletConnect, etc.)

### 🔍 Important Code Sections

#### CreateEscrowForm.tsx - USDC Approval Flow
```typescript
// Line 50: Convert amount to USDC units (6 decimals)
const amountWei = web3!.utils.toWei(amount, 'mwei');

// Lines 75-93: Approve USDC and verify
const approveTx = usdcContract.methods.approve(CONTRACT_ADDRESS, amountWei);
const allowance = await usdcContract.methods.allowance(account, CONTRACT_ADDRESS).call();
if (BigInt(String(allowance)) < BigInt(amountWei)) {
  throw new Error('Approval verification failed - allowance insufficient');
}
```

#### EscrowList.tsx - Decimal Conversion
```typescript
// Line 49: Use 'mwei' for 6-decimal USDC
amount: web3!.utils.fromWei(String(escrowData[2]), 'mwei'),
```

#### EscrowDetail.tsx - Date Formatting
```typescript
// Locale set to 'en-US' for English date formatting
return new Date(timestamp * 1000).toLocaleDateString('en-US', {...});
```

### 🔗 Important Links
- **Live App**: https://instant-escrow-ui.vercel.app
- **GitHub Repository**: https://github.com/ezraike/instant-escrow-ui
- **Smart Contract**: 0xB3aC493E019Ed51794bC00B60c830aaEeF22814d (Arc Testnet)
- **Arc Documentation**: https://docs.arc.network
- **Block Explorer**: https://testnet.arcscan.app
- **USDC Faucet**: https://faucet.circle.com

### 📋 Common Development Tasks

#### Adding a New Feature
1. Create component in `components/`
2. Add Web3 integration if needed in `lib/web3-context.tsx`
3. Update contract ABI in `lib/contract.ts` if calling new functions
4. Import and use component in `app/page.tsx`
5. Test with MetaMask on Arc Testnet
6. Commit and push: `git add . && git commit -m "feat: description" && git push`

#### Fixing USDC-Related Issues
1. Check if using `'mwei'` (not `'ether'`)
2. Verify decimal conversion is applied to both amount input AND balance display
3. Test with actual USDC transfers
4. Commit: `git commit -m "fix: USDC decimal/conversion issue"`

#### Deploying Changes
1. Push to GitHub main branch
2. Vercel automatically detects push
3. Production deployment happens in ~1-2 minutes
4. Check deployment status at: https://vercel.com (dashboard)

#### Testing Locally
```bash
cd instant-escrow-ui
npm install
npm run dev
# Open http://localhost:3000
```

### 🐛 Known Issues & Limitations
- USDC faucet may have rate limiting on Arc Testnet
- MetaMask may require manual network switching to Arc Testnet
- Escrow list auto-refreshes every 10 seconds (could be optimized with WebSocket)

### 💡 Best Practices for This Project
1. Always use `'mwei'` for USDC conversions, never `'ether'`
2. Verify allowance before creating escrow
3. Keep error messages user-friendly and actionable
4. Test all changes on Arc Testnet before pushing
5. Update this file when adding new features or discovering issues
6. Use descriptive commit messages with feature/fix prefix

### 📞 When Returning to Development
1. Pull latest changes: `git pull`
2. Read the recent commits: `git log --oneline -10`
3. Check Vercel deployment status
4. Start local dev: `npm run dev`
5. Reference this DEVELOPMENT.md for quick context

---

**Last Updated**: December 1, 2025
**Project Created**: December 1, 2025
**Status**: Active Development

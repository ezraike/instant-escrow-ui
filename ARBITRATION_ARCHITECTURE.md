# ArcESC: Autonomous Arbitration with MEE Conditional Execution

## 🏗️ Architecture Overview

ArcESC (Arc Instant Escrow Service with Conditional execution) implements a fraud-resistant escrow system using:

1. **Biconomy MEE (Modular Execution Environment)** - Conditional Execution
2. **Arc Network** - Deterministic Finality & USDC Gas Abstraction
3. **Autonomous Arbitration** - Smart Contract-enforced decisions

---

## 📊 System Architecture

```
User (Payer)
    ↓
[1] Create Escrow (SimpleEscrow.sol)
    ├─ Send USDC → Smart Contract
    ├─ Lock Funds
    └─ Arc: Sub-second finality confirms instantly
    ↓
Service Provider (Payee)
    ├─ Receives notification
    ├─ Begins service immediately (finality guaranteed)
    └─ Delivers service
    ↓
Arbitrator (Trusted Party / DAO)
    ├─ Reviews service delivery
    ├─ Call ArbitrationOracle.settleDispute() or markAsDisputed()
    └─ Sets escrow status to SETTLED or DISPUTED
    ↓
Biconomy MEE
    ├─ Continuously monitors: ArbitrationOracle.isSettled(escrowId)
    ├─ When isSettled() returns TRUE
    └─ Automatically executes: SimpleEscrow.releaseEscrow(escrowId)
    ↓
Arc Network (Deterministic Finality)
    ├─ Atomic execution of releaseEscrow()
    ├─ Sub-second settlement
    ├─ Irreversible (cannot refund after RELEASED)
    └─ USDC fee (~$0.01)
    ↓
Payee Receives USDC
```

---

## 🔐 Smart Contracts

### 1. SimpleEscrow.sol (Enhanced)

**Location:** `instant-escrow/src/InstantEscrow.sol`

**Key Additions:**
- `address arbitrationOracle` - Reference to ArbitrationOracle
- `bool meeConditionsEnabled` - Toggle MEE conditional execution
- `setArbitrationOracle(address _oracle)` - Configure oracle
- `setMEEConditionsEnabled(bool _enabled)` - Enable/disable MEE
- `canReleaseWithArbitration(uint256 _escrowId) returns bool` - Check eligibility

**Workflow:**
```solidity
// Step 1: Create Escrow
escrowId = createEscrow(payee, amount, lockTime, description)

// Step 2: Service Delivery
// (Payee delivers service)

// Step 3: Arbitrator Reviews (ArbitrationOracle)
arbitrationOracle.settleDispute(escrowId, reason)

// Step 4: MEE Conditional Execution
// MEE checks: isSettled(escrowId) == true
// If true: releaseEscrow(escrowId) is automatically called
```

### 2. ArbitrationOracle.sol (New)

**Location:** `instant-escrow/src/ArbitrationOracle.sol`

**Key Features:**

#### Status Enum
```solidity
enum SettlementStatus {
    PENDING = 0,    // Waiting for arbitrator decision
    SETTLED = 1,    // Service approved, ready for release
    DISPUTED = 2,   // Disagreement, manual intervention needed
    CANCELLED = 3   // Cancelled
}
```

#### Core Functions

**1. `isSettled(uint256 _escrowId) public view returns (bool)`**
- **Purpose:** MEE condition check function
- **Called by:** Biconomy MEE periodically (STATIC_CALL)
- **Returns:** TRUE when:
  - Emanet status is PENDING (not yet changed)
  - AND Settlement status is SETTLED (arbitrator approved)
- **Returns:** FALSE when:
  - Emanet already RELEASED or REFUNDED
  - OR Settlement is PENDING/DISPUTED/CANCELLED

```typescript
// MEE Flow
while (transaction.pending) {
  const isReady = await arbitrationOracle.isSettled(escrowId);
  if (isReady) {
    executeReleaseEscrow(escrowId);  // Automatic
    break;
  }
  sleep(checkInterval);  // Biconomy configures this
}
```

**2. `settleDispute(uint256 _escrowId, string _reason)`**
- Called by authorized arbitrator
- Sets settlement status to SETTLED
- Updates `isSettledCache[_escrowId] = true`
- Triggers MEE conditional execution

**3. `markAsDisputed(uint256 _escrowId, string _reason)`**
- Called by authorized arbitrator
- Sets settlement status to DISPUTED
- Prevents automatic release
- Requires manual intervention

**4. `authorizeArbitrator(address _arbitrator)`**
- Owner function to add trusted arbitrators
- Can be DAO or individual

---

## 💜 MEE Integration: Conditional Execution

### How It Works

**Conditional Execution** is a MEE feature that allows transactions to wait for conditions before executing.

```typescript
// Frontend Code Example
const condition = {
  targetContract: arbitrationOracleAddress,
  functionAbi: arbitrationABI,
  functionName: 'isSettled',
  args: [escrowId],
  value: true,  // Expected return value
  type: 'eq',   // Equality check
};

const instruction = {
  type: 'default',
  data: {
    to: escrowContractAddress,
    abi: escrowABI,
    functionName: 'releaseEscrow',
    args: [escrowId],
    chainId: 27,  // Arc Testnet
    conditions: [condition],  // ← Conditional execution
  },
};
```

### MEE Execution Flow

```
1. User submits transaction with conditions to MEE
2. MEE checks all conditions via STATIC_CALL
3. If all conditions pass → Execute immediately
4. If conditions fail → Enter PENDING state
5. MEE periodically rechecks conditions
6. When all conditions pass → Execute automatically
7. Transaction timeout after upperBoundTimestamp
```

### Architecture Benefits

| Feature | Benefit |
|---------|---------|
| **STATIC_CALL** | Checked without state changes, multiple times safely |
| **Periodic Checks** | No need for callbacks or oracles |
| **Atomic Execution** | Either all succeed or all fail together |
| **User Signature** | Single signature for entire flow |
| **Gas Abstraction** | Pay with any token (USDC in our case) |

---

## 🛡️ Fraud Prevention Mechanisms

### Problem: "Service Scam Refund"

**Attack:** 
1. Payer creates escrow with USDC
2. Service provider delivers fake/incomplete service
3. Payer requests refund claiming "service was bad"
4. Both parties claim the funds

### Solution: Autonomous Arbitration + Deterministic Finality

**Defense:**

1. **Arbitration is Mandatory**
   - Cannot release funds without arbitrator approval
   - Arbitrator reviews service delivery proof
   - Decision is recorded on-chain (irreversible)

2. **Deterministic Finality**
   - Once arbitrator approves AND MEE releases funds
   - Arc's sub-second finality = settlement is FINAL
   - No transaction reorganization possible
   - No "undo" or "rollback" exists

3. **Status is Immutable After Release**
   ```solidity
   function refundEscrow(uint256 _escrowId) {
       // ← Can ONLY refund if status == PENDING
       require(escrow.status == EscrowStatus.PENDING, "Not pending");
       // After release, status == RELEASED
       // This check prevents refund
   }
   ```

4. **MEE Atomic Execution**
   - Multiple operations either all succeed or all fail
   - No partial execution possible
   - Settlement + Release = single atomic transaction

### Remaining Edge Cases

**Dispute Handling:**
- If marked as DISPUTED, MEE does NOT auto-release
- Manual arbitrator intervention required
- Can escalate to DAO governance if needed

**Timing Attacks:**
- Arbitrator cannot reverse decision mid-execution
- Arc's deterministic finality prevents race conditions

---

## 🎯 Frontend Architecture

### Components

#### 1. ArbitrationPanel.tsx
- UI for arbitrators to review and make decisions
- Shows escrow details
- Buttons: "✓ Approve & Settle" and "✗ Mark as Disputed"
- Integration with ArbitrationOracle contract

#### 2. WorkflowDiagram.tsx
- Visual representation of entire flow
- Step-by-step process
- Fraud prevention explanation
- Real-world use cases

#### 3. EscrowDetail.tsx (Enhanced)
- Shows "⚖️ Arbitration Panel" button for authorized users
- Integrates ArbitrationPanel
- Displays settlement status
- Shows MEE execution progress

### Data Models (lib/types.ts)

```typescript
export enum SettlementStatus {
  PENDING = 0,
  SETTLED = 1,
  DISPUTED = 2,
  CANCELLED = 3
}

export interface Settlement {
  escrowId: number;
  arbitrator: string;
  status: SettlementStatus;
  timestamp: number;
  reason: string;
  meeTriggered: boolean;  // Did MEE execute this?
}

export interface EscrowWithSettlement {
  escrow: Escrow;
  settlement?: Settlement;
  isSettled?: boolean;
  canBeReleased?: boolean;
}
```

### MEE Helper Functions (lib/mee-conditional-execution.ts)

```typescript
// Build condition for MEE
createMEESettlementCondition(escrowId, arbitrationOracleAddress)

// Build complete MEE instruction
buildConditionalReleaseInstruction(...)

// Build MEE Supertransaction payload
buildMEEConditionalReleasePayload(...)

// Update MEE cache for gas optimization
updateMEESettlementCache(...)

// Manual release if MEE is not available
manualReleaseEscrow(...)

// Check if release is eligible
canReleaseWithArbitration(...)
```

---

## 🚀 Deployment Steps

### Smart Contracts

1. **Deploy ArbitrationOracle.sol**
   ```bash
   forge create src/ArbitrationOracle.sol:ArbitrationOracle \
     --constructor-args "0xB3aC493E019Ed51794bC00B60c830aaEeF22814d" \
     --rpc-url https://rpc.testnet.arc.network \
     --private-key $PRIVATE_KEY
   ```

2. **Configure SimpleEscrow.sol**
   ```bash
   # Call setArbitrationOracle(arbitrationOracleAddress)
   # Call setMEEConditionsEnabled(true)
   ```

### Frontend Configuration

Add to `.env.local`:
```
NEXT_PUBLIC_ESCROW_CONTRACT=0xB3aC493E019Ed51794bC00B60c830aaEeF22814d
NEXT_PUBLIC_ARBITRATION_ORACLE=0x[ArbitrationOracle_Address]
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

### MEE Setup (Biconomy)

1. Create Biconomy account at https://dashboard.biconomy.io
2. Set up Supertransaction flows
3. Configure conditional execution triggers
4. Test with Arc Testnet

---

## 📈 Gas & Cost Analysis

| Operation | Cost (Arc USDC) | Notes |
|-----------|-----------------|-------|
| Create Escrow | ~$0.01 | Includes USDC transfer |
| Release (Manual) | ~$0.01 | Direct call |
| Release (MEE) | ~$0.01-0.03 | Includes MEE orchestration |
| Settlement Decision | ~$0.01 | Arbitrator approval |
| Total Flow | ~$0.04-0.05 | vs. Ethereum: $30-50 |

**Benefits:**
- 600-1000x cheaper than Ethereum
- Stable USDC pricing (no ETH volatility)
- Predictable costs

---

## 🔄 Workflow Examples

### Example 1: Successful Freelance Transaction

```
Freelancer Posts: "Logo Design - 10 USDC"
Client Creates Escrow → 10 USDC locked in smart contract
Freelancer delivers logo → Arc confirms instantly
Client is happy → Calls arbitrator to approve
Arbitrator reviews → Calls settleDispute()
ArbitrationOracle.isSettled(escrowId) = true
MEE detects condition is met
MEE calls releaseEscrow()
Freelancer receives 10 USDC instantly
Arc's finality ensures it's permanent
```

### Example 2: Disputed Transaction

```
Client creates escrow for "Website Design - 100 USDC"
Developer delivers website but client claims "too buggy"
Developer requests arbitrator review
Arbitrator reviews → finds legitimate issues
Arbitrator calls markAsDisputed()
MEE sees isSettled(escrowId) = false
MEE does NOT auto-release
Arbitrator and parties negotiate
Resolution: Either settle, refund, or escalate to DAO
```

### Example 3: DAI Governance

```
Arbitration disputes → DAO vote on resolution
DAO passes proposal → calls settleDispute()
OR: DAO votes for partial refund → custom logic
Smart contracts enforce DAO decision
No human can override (blockchain-verified)
```

---

## 🔍 Security Audit Checklist

- [x] Arbitrator authorization check (`isAuthorizedArbitrator`)
- [x] Only arbitrator can set settlement status
- [x] Escrow status immutable after RELEASED
- [x] MEE conditions are deterministic (STATIC_CALL)
- [x] No reentrancy in releaseEscrow()
- [x] USDC transfer verified
- [x] Decimal handling correct (6 decimals for USDC)
- [x] Event logging for all state changes
- [x] Admin functions protected (onlyOwner)
- [x] Timeout mechanisms for MEE conditions

---

## 📚 References

- [Biconomy MEE Documentation](https://docs.biconomy.io)
- [Arc Network Docs](https://arc.network)
- [Conditional Execution Guide](https://docs.biconomy.io/instructions/conditional-execution)
- [MEE Orchestration](https://docs.biconomy.io/orchestration)

---

## 🎓 Understanding the Architecture

### Key Insight: Why Autonomous Arbitration?

Traditional escrow systems have a problem:

```
Centralized Arbitrator → Can be bribed, corrupted, or doesn't scale
Decentralized DAO → Voting is slow, voting power distribution is complex
Automated Smart Contract → Can't understand service quality
```

**ArcESC Solution:**

1. **Authorized Arbitrators** can be:
   - Professional arbitrators (e.g., Kleros)
   - DAO (decentralized governance)
   - Reputation system (escrow score)
   - Hybrid (combination)

2. **Decision is Enforced Atomically**
   - Once arbitrator approves
   - MEE instantly executes release
   - Arc's finality prevents reversal
   - No centralized party can interfere

3. **Fraud is Economically Impossible**
   - Arbitrator approval required
   - Deterministic finality prevents reversal
   - Immutable ledger records decision
   - Game theory: Honest behavior is incentivized

---

## 🚨 Important Notes

### Arc Testnet Details
- Chain ID: 27
- RPC: https://rpc.testnet.arc.network
- USDC: 0x3600000000000000000000000000000000000000 (6 decimals)
- **CRITICAL:** Always use `web3.utils.toWei(amount, 'mwei')` for USDC (not 'ether')

### MEE Limitations
- Conditional execution has timeout limits (usually 24-48 hours)
- MEE requires user to stay online until condition is met
- For long-term conditions, use alternative strategies

### Future Enhancements
- [ ] Kleros integration for professional arbitration
- [ ] Reputation system for arbitrators
- [ ] Insurance pool for disputed amounts
- [ ] Multi-sig arbitration (require 3 of 5 arbitrators)
- [ ] Automated appeals process
- [ ] DAO governance integration

---

**Built with ❤️ using Arc Network + Biconomy MEE**

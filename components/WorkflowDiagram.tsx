'use client';

import React from 'react';

/**
 * ArcESC Workflow Diagram
 * 
 * Otomatik Hakemlik ile Koşullu Mutabakat Mimarisi Visualization
 */
export const WorkflowDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 Workflow: Autonomous Arbitration with MEE</h3>

      {/* Main Workflow */}
      <div className="space-y-4">
        {/* Step 1: Create */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">1️⃣</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-900">Create Escrow</h4>
            <p className="text-sm text-gray-600">
              Payer sends USDC to smart contract. Funds are locked and immediately escrowed.
            </p>
            <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <strong>Arc Benefit:</strong> Sub-second finality confirms escrow instantly
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-2xl text-gray-400">↓</div>
        </div>

        {/* Step 2: Service Delivery */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">2️⃣</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-900">Service Delivery</h4>
            <p className="text-sm text-gray-600">
              Payee provides service. Due to instant finality, they can begin work immediately after escrow creation.
            </p>
            <div className="mt-2 text-xs bg-green-50 p-2 rounded border border-green-200">
              <strong>Innovation:</strong> Service provider no longer waits for confirmations
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-2xl text-gray-400">↓</div>
        </div>

        {/* Step 3: Arbitration Review */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">3️⃣</span>
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-gray-900">Arbitration Review</h4>
            <p className="text-sm text-gray-600">
              Authorized arbitrator (trusted party or DAO) reviews the service delivery and makes a decision.
            </p>
            <div className="mt-2 flex gap-2">
              <button className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition">
                ✓ Approve Settlement
              </button>
              <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition">
                ✗ Mark Disputed
              </button>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-2xl text-gray-400">↓</div>
        </div>

        {/* Step 4a: SETTLED */}
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">4️⃣</span>
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-900">MEE Conditional Execution Triggers</h4>
              <p className="text-sm text-gray-600">
                When arbitrator approves settlement, ArbitrationOracle.isSettled(escrowId) returns TRUE
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <p>
                  <strong>MEE Flow:</strong> Continuously checks isSettled() via STATIC_CALL
                </p>
                <p className="text-green-700">
                  ✓ isSettled() = TRUE → MEE automatically calls releaseEscrow()
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="text-2xl text-gray-400">↓</div>
        </div>

        {/* Step 5: Automatic Release */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">5️⃣</span>
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-900">Automatic Fund Release</h4>
              <p className="text-sm text-gray-600">
                MEE calls releaseEscrow() automatically. Funds transfer to payee instantly.
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-blue-700">
                  💜 <strong>Biconomy MEE:</strong> Handles orchestration with single user signature
                </p>
                <p className="text-blue-700">
                  ⚡ <strong>Arc Finality:</strong> Sub-second deterministic finality = instant settlement
                </p>
                <p className="text-blue-700">
                  💰 <strong>USDC Gas:</strong> Stable, predictable fees (∼$0.01)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Prevention */}
      <div className="mt-6 bg-red-50 border border-red-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">🛡️ Fraud Prevention: No Refund After Settlement</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Once arbitrator approves settlement and MEE triggers release:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Emanet status changes to RELEASED (permanently)</li>
            <li>Payer CANNOT request refund (refund only works on PENDING status)</li>
            <li>Arc's deterministic finality makes this IRREVERSIBLE</li>
            <li>No more "service was bad" scams after receiving payment</li>
          </ul>
        </div>
      </div>

      {/* Architecture Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <h5 className="font-semibold text-gray-900 mb-2">💜 Biconomy MEE</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>✓ Conditional Execution</li>
            <li>✓ Orchestration</li>
            <li>✓ Single Signature</li>
            <li>✓ Gas Abstraction</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <h5 className="font-semibold text-gray-900 mb-2">⚡ Arc Network</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>✓ Sub-Second Finality</li>
            <li>✓ EVM Compatible</li>
            <li>✓ USDC Gas Fees</li>
            <li>✓ Deterministic</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <h5 className="font-semibold text-gray-900 mb-2">🔐 Security</h5>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>✓ Autonomous Arbitration</li>
            <li>✓ No Fraud After Settlement</li>
            <li>✓ Instant Finality</li>
            <li>✓ Atomic Transactions</li>
          </ul>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Real-World Use Cases</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex gap-2">
            <span className="text-lg">🎨</span>
            <div>
              <strong>Freelance Work:</strong> Designer delivers logo, arbitrator approves, funds release instantly
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">🛍️</span>
            <div>
              <strong>P2P Commerce:</strong> Seller ships item, buyer confirms receipt via arbitrator, payment instant
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">📚</span>
            <div>
              <strong>Course Sales:</strong> Student enrolls, completes milestone, teacher approves payment
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-lg">🤝</span>
            <div>
              <strong>Partnership Splits:</strong> Automated payments upon delivery milestones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

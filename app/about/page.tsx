import Link from 'next/link';

export const metadata = {
  title: 'About ArcESC - Secure Escrow Management',
  description: 'Learn about ArcESC, the instant payment and settlement agreement platform on Arc Network',
};

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              🔐 ArcESC
            </h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/app" className="text-gray-600 hover:text-gray-900 transition">
              Dashboard
            </Link>
            <Link href="/about" className="text-blue-600 font-semibold hover:text-blue-800 transition">
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* What is ArcESC */}
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is ArcESC?</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            The Instant Payment and Settlement Agreement (Simple Escrow Agreement) is a USDC-based simple smart contract application that can be developed on the Arc Testnet, aiming to instantly complete payment or service settlement. This contract leverages Arc's core features to hold funds and release them instantly when certain conditions are met (e.g., when the delivery of a service is confirmed).
          </p>
        </section>

        {/* Why Use ArcESC */}
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use ArcESC?</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            ArcESC is preferred primarily due to Arc's architecture, which delivers enterprise-level performance and security:
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Instant and Irreversible Settlement</h3>
              <p className="text-gray-700 leading-relaxed">
                Arc's greatest benefit is that transactions settle in under a second (sub-second). Once a transaction is settled, it is irreversible and cannot be reordered (it is not probabilistic). This certainty allows off-chain systems to confidently accept that funds have been released without the risk of block organization and to trigger service delivery immediately.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Predictable and Low Cost</h3>
              <p className="text-gray-700 leading-relaxed">
                Arc uses USDC as its native token instead of volatile ETH. Since gas fees are denominated in USDC, cost predictability is high, typically targeting approximately 1 cent (~$0.01) per transaction. This simplifies accounting processes and enables low-cost global payments.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Security and Enterprise Assurance</h3>
              <p className="text-gray-700 leading-relaxed">
                Arc uses a Tendermint-based BFT (Byzantine Fault Tolerant) protocol called Malachite and a permissioned Proof-of-Authority (PoA) validator set. This design provides stronger assurances for financial applications by replacing economic incentives with enterprise accountability.
              </p>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Features</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            ArcESC incorporates the critical features offered by the Arc network:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">⚡</span> Deterministic Finality
              </h3>
              <p className="text-gray-700 text-sm">
                A transaction is either not finalized or finalized; there is no "probably finalized" state. Blocks finalize in &lt;1 second, allowing applications to release funds immediately after a single confirmation without waiting for additional block confirmations.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">💰</span> USDC Native Gas Token
              </h3>
              <p className="text-gray-700 text-sm">
                All fees and balances on the network are denominated in USDC. The escrow contract must use the optional USDC ERC-20 interface with 6 decimal places of precision to manage funds. Local USDC with 18 decimal places of precision is used to pay gas fees.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🔧</span> EVM Compatibility
              </h3>
              <p className="text-gray-700 text-sm">
                Arc is compatible with the Ethereum Virtual Machine (EVM). Developers can use familiar tools such as Solidity, Foundry, and Hardhat to write the escrow contract.
              </p>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">📊</span> Stable Fee Mechanism
              </h3>
              <p className="text-gray-700 text-sm">
                The fee market uses a base fee similar to EIP-1559 but smoothed with an exponentially weighted moving average (EWMA) to increase predictability.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use?</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Connect with MetaMask or any compatible wallet. Make sure you're on Arc Network.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enter Recipient Address</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Fill in the public address of the wallet you want to create the escrow for.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enter the Amount</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Specify the amount you want to send for the escrow fee.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Specify the Lock-Up Period</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Specify how long the escrow fee will be locked up; you can release the assets early if the transaction is approved.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  5
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Send a Note</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Optionally, send a notification to the person you are escrowing with.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-semibold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Escrow</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Complete all steps and initiate the process.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/app"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              Built with ❤️ by{' '}
              <a
                href="https://x.com/ezraike"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition font-semibold"
              >
                ezraike
              </a>
            </p>
            <p className="mb-4">Powered by Arc Network</p>
            <p className="border-t border-gray-600 pt-4">© 2024 ArcESC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

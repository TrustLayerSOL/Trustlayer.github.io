export default function App() {
  return (
    <main className="min-h-screen bg-black text-white px-6">
      {/* NAV */}
      <nav className="flex items-center justify-between py-6 max-w-6xl mx-auto">
        <div className="text-xl font-bold">
          TrustLayerSOL
        </div>

        <a
          href="https://x.com/jordanposs"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
        >
          jordanposs
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Trust Intelligence for Solana
        </h1>

        <p className="text-lg text-white/70 mb-8">
          Identify trustworthy wallets, detect risky tokens, and track smart money before the market reacts.
        </p>

        <a
          href="https://x.com/jordanposs"
          target="_blank"
          rel="noreferrer"
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
        >
          Follow @jordanposs
        </a>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto py-16 grid md:grid-cols-3 gap-8">
        <div className="border border-white/10 p-6 rounded-xl bg-white/5">
          <h3 className="text-lg font-semibold mb-2">Wallet Scoring</h3>
          <p className="text-white/70 text-sm">
            Evaluate wallets based on behavior, history, and profitability patterns.
          </p>
        </div>

        <div className="border border-white/10 p-6 rounded-xl bg-white/5">
          <h3 className="text-lg font-semibold mb-2">Token Risk Signals</h3>
          <p className="text-white/70 text-sm">
            Detect early signs of rugs, dumps, and suspicious activity.
          </p>
        </div>

        <div className="border border-white/10 p-6 rounded-xl bg-white/5">
          <h3 className="text-lg font-semibold mb-2">Smart Money Tracking</h3>
          <p className="text-white/70 text-sm">
            Follow high-performing wallets and react faster than the crowd.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-12 text-white/40 text-sm">
        © {new Date().getFullYear()} TrustLayerSOL
      </footer>
    </main>
  );
}

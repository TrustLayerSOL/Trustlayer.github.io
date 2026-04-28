export default function App() {
return (
<main className="min-h-screen bg-[#F8FAF3] text-slate-950">
  <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950 shadow-sm">
        TL
      </div>

      <div>
        <p className="text-lg font-black tracking-tight">TrustLayerSOL</p>
        <p className="text-xs font-medium text-slate-500">
          Solana trust intelligence
        </p>
      </div>
    </div>

    <a
      href="https://x.com/jordanposs"
      target="_blank"
      rel="noreferrer"
      className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
    >
      @jordanposs
    </a>
  </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm">
            Built for the fun, fast, chaotic world of Solana memes
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            A cleaner way to spot trust on Solana.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            TrustLayerSOL is building simple wallet intelligence, token risk signals,
            and smart-money alerts for traders who want more signal before they ape.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://x.com/jordanposs"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-emerald-400 px-7 py-4 text-center text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Follow @jordanposs
            </a>

            <a
              href="#features"
              className="rounded-full border border-slate-200 bg-white px-7 py-4 text-center text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              See what we’re building
            </a>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-100 via-cyan-100 to-yellow-100 p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-black">Live Signal Preview</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
                beta concept
              </span>
            </div>

            <div className="space-y-4">
              <Signal title="Wallet activity" value="3 tracked wallets bought" good />
              <Signal title="Token risk" value="Medium — early activity detected" />
              <Signal title="Momentum" value="Volume rising across fresh wallets" good />
              <Signal title="Trust note" value="Watch before chasing the candle" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
            The idea
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            Meme coin energy, serious signal.
          </h2>
          <p className="mt-4 text-slate-600">
            The goal is not to make trading boring. It’s to make the chaos easier to read.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            emoji="👀"
            title="Wallet Watching"
            text="Track wallets that matter and see when they move into new tokens."
          />
          <Feature
            emoji="⚠️"
            title="Risk Signals"
            text="Surface suspicious behavior, sudden dumps, fresh-wallet clusters, and other red flags."
          />
          <Feature
            emoji="🚀"
            title="Smart Alerts"
            text="Get cleaner alerts instead of drowning in noise from every random chart move."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                Built in public. Follow the launch.
              </h2>
              <p className="mt-3 max-w-2xl text-white/70">
                TrustLayerSOL is starting as off-chain intelligence and alerts, then expanding from there.
              </p>
            </div>

            <a
              href="https://x.com/jordanposs"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-7 py-4 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              @jordanposs
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} TrustLayerSOL. Built for Solana.</p>
        <a
          href="https://x.com/jordanposs"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-slate-800 hover:text-emerald-600"
        >
          @jordanposs
        </a>
      </footer>
    </main>
  );
}

function Feature({ emoji, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
        {emoji}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Signal({ title, value, good }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-500">{title}</p>
          <p className="mt-1 font-black text-slate-950">{value}</p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            good ? "bg-emerald-400" : "bg-yellow-400"
          }`}
        />
      </div>
    </div>
  );
}

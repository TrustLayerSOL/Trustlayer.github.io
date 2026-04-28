import React from "react"; import { ShieldCheck, Gift, Eye, Lock, ArrowRight, Clock, Wallet, BarChart3 } from "lucide-react";

export default function TrustLayerLandingPage() { return ( <main className="min-h-screen bg-[#050507] text-white overflow-hidden"> <div className="absolute inset-0 bg-[radial-gradient(circle_at_top[...]
href="https://x.com/jordanposs"
target="_blank"
rel="noreferrer"
className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
> Follow the build </a> </nav>

<section className="grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Transparent reward layer for meme coins
        </div>
        <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
          Most meme coins extract from holders.
          <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            We route it back.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
          TrustLayer helps projects route fees into visible reward vaults, track holder eligibility, and show payouts publicly — so communities can see the flow instead of guessing.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://x.com/jordanposs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black hover:bg-emerald-200"
          >
            DM for early access <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-900/20 backdrop-blur">
        <div className="rounded-[1.5rem] border border-purple-400/25 bg-black/40 p-5">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-purple-200/80">Live model</p>
          <div className="space-y-4">
            {[
              ["Traders", "Buy & sell the token", Wallet],
              ["Fees", "Generated from volume", BarChart3],
              ["Vault", "Funds flow into public tracking", Lock],
              ["Smart Rewards", "Eligible holders are scored", Gift],
              ["Holders", "Payouts are visible", ShieldCheck],
            ].map(([title, body, Icon], index) => (
              <div key={String(title)} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/25 to-emerald-400/20">
                  <Icon className="h-6 w-6 text-emerald-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{index + 1}. {title}</p>
                  <p className="text-sm text-white/60">{body}</p>
                </div>
                {index < 4 && <ArrowRight className="hidden h-5 w-5 text-purple-300 sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Transparent", "Every deposit, payout, and reward cycle is designed to be publicly visible.", Eye],
        ["Holder-first", "Reward scoring favors conviction and longer holding, not quick insider exits.", Gift],
        ["Verification", "Projects can earn a public status page and badge — and lose it if rules break.", ShieldCheck],
        ["No extra friction", "Traders do not need a login. They can monitor rewards from a public dashboard.", Clock],
      ].map(([title, body, Icon]) => (
        <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <Icon className="mb-5 h-8 w-8 text-emerald-300" />
          <h3 className="text-xl font-black">{title}</h3>
          <p className="mt-3 leading-7 text-white/65">{body}</p>
        </div>
      ))}
    </section>

    <section className="py-16">
      <div className="rounded-[2rem] border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 via-white/[0.04] to-purple-500/10 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Early access is opening soon.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
          Launching first with selected Solana projects and KOL-backed communities. The first proof-of-concept token will demonstrate vault tracking, holder scoring, and public payouts.
        </p>
        <a
          href="https://x.com/jordanposs"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-7 py-3 font-black text-black hover:bg-white"
        >
          Contact @JordanTradeSOL <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>

    <footer className="border-t border-white/10 py-8 text-sm text-white/45">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TrustLayer. Building in public.</p>
        <p>Rewards are variable. No guarantees. Experimental software.</p>
      </div>
    </footer>
  </div>
</main>

); }

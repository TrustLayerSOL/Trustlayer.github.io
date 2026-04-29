# TrustLayer Build Tracker

Living checklist for taking TrustLayer from prototype to a launch-ready product.

Project: TrustLayer  
First proof coin: `$RECEIPTS`  
Target launch window: May 6, 2026, only if product is ready  
Primary domain: https://trustlayer.fun  
Last updated: 2026-04-29  
Tracker owner: Codex / project lead

## Status Legend

| Status | Meaning |
|---|---|
| `Not Started` | No meaningful work begun |
| `In Progress` | Actively being worked |
| `Blocked` | Waiting on dependency or decision |
| `Review` | Built and awaiting review/testing |
| `Done` | Meets acceptance criteria |
| `Deferred` | Intentionally postponed |

## Launch Gates

TrustLayer should not launch `$RECEIPTS` until every hard gate below is `Done`.

| Gate | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Product launch scope locked | In Progress | Product | Launch scope documented; non-launch features deferred | `$RECEIPTS` selected; one-launch strategy chosen |
| `$RECEIPTS` token safety validation complete | Blocked | Safety | Final mint scanned and raw result recorded | Waiting on final mint address |
| Strict token safety standard enforced | In Progress | Safety | Scanner hard-blocks banned authorities/extensions | Pure policy evaluator + tests done; live RPC parsing next |
| Backend reward engine production path ready | In Progress | Backend | Reward calculations reproducible from real inputs | Demo engine and tests exist |
| Solana vault program launch readiness confirmed | In Progress | Solana | Anchor build/tests pass; deployment plan documented | Anchor build passes locally; deeper tests needed |
| Dashboard minimum viable workflow complete | Not Started | Frontend / Backend | Token scan, trust status, reward proof, manifest view work | Needs scanner/API first |
| Product site updated for launch | In Progress | Frontend / Marketing | Site communicates TrustLayer, `$RECEIPTS`, safety rules, launch state | Light product site live |
| Legal/risk language approved | In Progress | Legal/Risk | No profit/safety overclaims; clear meme-coin risk language | Guardrails documented |
| Ops monitoring and incident process ready | Not Started | Ops | Logs, alerts, uptime checks, rollback process documented |  |
| Launch decision made | Not Started | Product | Go/no-go recorded with date and reason | Target is May 6 if ready |

## Phase 1: Product / Scope

Goal: define the launchable TrustLayer product and the role of `$RECEIPTS`.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Define first proof coin | Done | Product | Name/ticker selected | `$RECEIPTS` |
| Define launch venue strategy | Done | Product | One clear launch strategy chosen | Launch on pump.fun, powered by TrustLayer proof layer |
| Define initial economics | Review | Product | Split documented and approved | Draft: 70% rewards / 20% protection reserve / 10% TrustLayer |
| Define strict token safety standard | Done | Safety | Hard-block list documented | See `docs/token-safety-standard.md` |
| Define launch user journey | In Progress | Product | Flow from launch to scan/proof/rewards written |  |
| Lock MVP feature list | In Progress | Product | Must-have, should-have, deferred features listed |  |
| Define non-goals for May 6 | Not Started | Product | Explicitly says what is not live at launch |  |
| Write product requirements doc | Not Started | Product | PRD matches implementation backlog |  |

## Phase 2: Product Site

Goal: make trustlayer.fun launch-ready and consistent with the light cockpit/product theme.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Deploy initial light product site | Done | Frontend | Site live at trustlayer.fun |  |
| Add demo payout manifest link | Done | Frontend / Backend | Public manifest reachable |  |
| Add launch status language | In Progress | Frontend / Product | Site clearly says beta/demo/live state |  |
| Add `$RECEIPTS` proof coin section | Not Started | Frontend / Marketing | `$RECEIPTS` appears without overpromising |  |
| Add token safety standard section | Not Started | Frontend / Safety | Hard-block rules visible in plain English |  |
| Add scanner entry point | Not Started | Frontend | User can paste mint and receive status | Needs scanner API |
| Add risk/disclaimer section | In Progress | Legal/Risk / Frontend | Visible and accurate risk language |  |
| Mobile QA | Review | Frontend | No broken layouts on mobile | Needs current screenshot pass |
| Deploy launch update | Not Started | Frontend / Ops | Production deploy verified |  |

## Phase 3: Backend / Reward Engine / Indexer

Goal: move from demo reward math to reproducible reward/proof infrastructure.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Build demo reward engine | Done | Backend | Splits inflow and calculates holder payouts | `backend/src/reward-engine.js` |
| Add reward-engine tests | Done | Backend | Test suite passes | `node backend/test/reward-engine.test.js` |
| Build demo manifest hash flow | Done | Backend | Manifest hash verifies | `backend/scripts/verify-demo-manifest.js` |
| Define production manifest schema | In Progress | Backend | Versioned schema with inputs/hash/recipients/totals | Demo schema exists |
| Define production reward inputs | Not Started | Backend / Product | Exact chain/account/event inputs listed |  |
| Choose RPC/indexing provider | Not Started | Backend / Ops | Provider selected and env vars documented |  |
| Implement wallet/activity indexing | Not Started | Backend | Holder/activity data is reproducible |  |
| Add API endpoints | Not Started | Backend | Dashboard can fetch scanner/reward/manifest state |  |
| Add production config | Not Started | Backend / Ops | Secrets/env documented and uncommitted |  |

## Phase 4: Token Safety Scanner

Goal: hard-block unsafe Solana mints before TrustLayer verification.

Hard-block if any are present:

- `permanentDelegate`
- `nonTransferable`
- default frozen account state
- `transferHook`
- `transferFeeConfig`
- unknown Token-2022 extensions
- mint authority present
- freeze authority present

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Document safety standard | Done | Safety / Marketing | Slogan + technical explanation saved | `docs/token-safety-standard.md` |
| Define scanner output schema | Done | Safety / Backend | Status, reasons, raw facts, mint, token program, timestamp | `backend/src/token-safety-scanner.js` |
| Detect SPL Token vs Token-2022 | Not Started | Safety | Token program identified correctly |  |
| Detect mint authority | Done | Safety | Any present authority hard-blocks | Policy evaluator covered by tests |
| Detect freeze authority | Done | Safety | Any present authority hard-blocks | Policy evaluator covered by tests |
| Detect Token-2022 extensions | In Progress | Safety | Banned and unknown extensions fail closed | Policy evaluator done; live mint parser next |
| Add tests for every hard-block | Done | Safety | Each banned condition has a test fixture | Covered in backend test suite |
| Add scanner API endpoint | Not Started | Backend / Safety | API returns deterministic pass/fail response |  |
| Add scanner UI state mapping | Not Started | Frontend / Safety | Dashboard shows clear fail reasons |  |
| Validate `$RECEIPTS` mint | Blocked | Safety | Final mint scanned and saved | Waiting on mint |

Acceptance standard:

- Unsafe tokens are blocked by default.
- Unknown Token-2022 extensions fail closed.
- Scanner language says whether a token meets TrustLayer's technical safety standard, not whether it is a good investment.

## Phase 5: Solana Contract / Anchor Vault Program

Goal: take the compiling Anchor scaffold to reviewed, tested, deployment-ready vault logic.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Install Solana/Rust/Anchor toolchain | Done | Solana / Ops | Versions available locally | See `docs/dev-toolchain.md` |
| Add Anchor workspace scaffold | Done | Solana | Workspace files exist |  |
| Add TrustLayer vault program scaffold | Done | Solana | Program compiles |  |
| Run Anchor build | Done | Solana | `anchor build` passes | Warnings remain; no hard errors |
| Document current program id | Done | Solana | Program ID recorded | `EFSdi1aqQsUg7Am9bqTDhxhKzB5EqJRJxT4Jiux3LX2s` |
| Define vault authority model | In Progress | Solana / Product | Admin, reviewer, pauser, upgrade controls documented |  |
| Add Anchor unit tests | Not Started | Solana | Happy path and unauthorized paths covered |  |
| Add local validator integration test | Not Started | Solana / Backend | deposit -> split -> payout round -> claim tested |  |
| Prepare devnet deployment | Not Started | Solana / Ops | Devnet deploy instructions and program ID recorded |  |
| Prepare mainnet launch checklist | Not Started | Solana / Ops | Signers, funding, rollback limits documented |  |
| External or second-pass review | Not Started | Solana | Reviewer notes resolved or accepted | Needed before meaningful funds |

## Phase 6: Dashboard

Goal: create the working TrustLayer product surface.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Define dashboard routes | Not Started | Product / Frontend | scan, token detail, rewards, manifests |  |
| Build token scan UI | Not Started | Frontend | Paste mint -> pass/fail state | Needs scanner API |
| Build token detail page | Not Started | Frontend / Backend | Shows mint facts, safety status, reasons |  |
| Build `$RECEIPTS` page | Not Started | Frontend / Product | Dedicated proof/reward view |  |
| Build reward summary UI | Not Started | Frontend / Backend | Shows periods, totals, eligibility, status |  |
| Build manifest viewer | Not Started | Frontend / Backend | Users can inspect manifest and hash |  |
| Add empty/error/loading states | Not Started | Frontend | Every API state handled clearly |  |
| Add responsive QA | Not Started | Frontend | Works on mobile and desktop |  |

## Phase 7: Marketing

Goal: prepare the public story and assets without overpromising.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Create X marketing plan | Done | Marketing | Plan saved | `marketing/x-marketing-plan.md` |
| Generate light product promo images | Done | Marketing | Assets saved locally | `marketing/images/` |
| Generate `$RECEIPTS` meme concepts | Done | Marketing | Meme images saved locally | `marketing/images/` |
| Research recent meme-coin patterns | Done | Marketing | Findings saved | `marketing/meme-coin-research-and-concepts.md` |
| Research launch timing | Done | Marketing / Ops | Best launch window identified | May 6, 8:30 AM PT if ready |
| Write `$RECEIPTS` launch thread | Not Started | Marketing / Legal/Risk | Copy matches actual product state |  |
| Prepare fake-CA warning posts | Not Started | Marketing / Ops | Ready before launch |  |
| Prepare launch FAQ | Not Started | Marketing / Product | Covers safety, rewards, risks, official links |  |
| Schedule content | Not Started | Marketing | Manual or scheduled posts ready |  |

## Phase 8: Legal / Risk Language

Goal: keep claims accurate and non-misleading.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Establish language guardrails | Done | Legal/Risk / Marketing | Avoid guaranteed, rug-proof, risk-free, insured, APY/yield claims |  |
| Draft scanner disclaimer | Not Started | Legal/Risk / Safety | Scanner checks technical criteria only |  |
| Draft rewards disclaimer | Not Started | Legal/Risk / Product | No profit/yield guarantees |  |
| Review `$RECEIPTS` launch language | Not Started | Legal/Risk / Marketing | No misleading safety or value claims |  |
| Decide terms/privacy pages | Not Started | Legal/Risk / Product | Decision documented |  |

Required language principles:

- Do not say TrustLayer makes a token safe as an investment.
- Do not promise profits, returns, yield, price appreciation, or protection from loss.
- Do not imply scanner approval eliminates rug, liquidity, market, governance, social, or operational risk.
- Do say TrustLayer checks a defined technical safety standard.
- Do say meme coins are highly speculative and users can lose money.

## Phase 9: Ops / Monitoring

Goal: make production systems deployable, observable, and recoverable.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Document environments | In Progress | Ops | Local/GitHub/Vercel documented | Vercel + GitHub connector works |
| Fix local GitHub push auth | Blocked | Ops | `git push origin main` works locally | Connector works; local credentials not configured |
| Set up backend deployment plan | Not Started | Ops / Backend | Host chosen and deployment steps documented |  |
| Set up logs | Not Started | Ops / Backend | Scanner/reward/job errors visible |  |
| Set up uptime checks | Not Started | Ops | Site/API monitored |  |
| Create incident runbook | Not Started | Ops | Triage, rollback, comms, owners documented |  |
| Create launch-day checklist | Not Started | Ops / Product | Step-by-step launch operations documented |  |

## Phase 10: Launch Readiness

Goal: make a clear go/no-go decision for the May 6 target.

| Task | Status | Owner | Acceptance Criteria | Notes |
|---|---|---|---|---|
| Create launch checklist | In Progress | Product / Ops | This tracker becomes source checklist |  |
| Define launch mode | Not Started | Product | Demo, beta, guarded mainnet, or full launch selected |  |
| Complete end-to-end demo | Not Started | Product / All | scan -> vault -> manifest -> proof flow works |  |
| Complete production smoke test | Not Started | Ops / All | Production environment works after deploy |  |
| Freeze launch copy | Not Started | Marketing / Legal/Risk | Copy matches actual launch mode |  |
| Record launch decision | Not Started | Product | Go/no-go note recorded |  |

## Go / No-Go Record

| Date | Decision | Owner | Reason | Follow-Up |
|---|---|---|---|---|
| 2026-04-29 | Pending | Product | Build in progress | Reassess after scanner + contract flow |

## Open Questions

| Question | Owner | Needed By | Status | Decision / Notes |
|---|---|---|---|---|
| What is the exact `$RECEIPTS` mint address? | Product / Safety | Before scanner validation | Open |  |
| Is May 6 launch full product, beta, or public demo? | Product | Before marketing freeze | Open |  |
| Does launch require mainnet Anchor program execution? | Product / Solana | Before deployment | Open | Recommended: only after full test flow |
| Which RPC/indexing provider will be used? | Backend / Ops | Before backend productionization | Open |  |
| Is wallet connection required at launch? | Product / Frontend | Before dashboard build | Open |  |
| Where will payout manifests be published or stored? | Backend / Ops | Before launch | Open | Current demo uses public JSON |
| Who controls deploys and program upgrades? | Product / Solana / Ops | Before launch | Open |  |

## Daily Progress Log

### 2026-04-29

Owner: Codex  
Status: In Progress  
Summary: TrustLayer has moved from concept to live site, backend demo, compiled Anchor scaffold, marketing assets, and a living build tracker.

Completed:

- [x] Light product site deployed
- [x] Reward engine demo and tests
- [x] Demo payout manifest and hash verification
- [x] Solana/Rust/Anchor toolchain installed
- [x] Anchor build passes
- [x] `$RECEIPTS` selected as proof coin
- [x] Marketing assets and X plan saved
- [x] Token safety standard documented
- [x] Build tracker created
- [x] Token safety policy evaluator implemented
- [x] Hard-block scanner tests added

Blocked:

- [ ] Final `$RECEIPTS` mint address
- [ ] Local GitHub push auth

Next:

- [x] Implement token safety scanner policy evaluator
- [x] Add scanner tests
- [x] Add scanner output examples
- [ ] Add live Solana mint parser
- [ ] Add scanner API endpoint
- [ ] Wire scanner into dashboard/site

## Final Launch Checklist

Do not mark launch ready until every item is checked.

- [ ] Product launch scope is frozen.
- [ ] `$RECEIPTS` mint address is confirmed.
- [ ] `$RECEIPTS` passes the TrustLayer technical safety scanner.
- [ ] Scanner hard-blocks all banned token conditions.
- [ ] Unknown Token-2022 extensions fail closed.
- [ ] Backend reward engine produces deterministic outputs.
- [ ] Payout manifest generation and validation are complete.
- [ ] Dashboard can scan tokens and show clear results.
- [ ] `$RECEIPTS` dashboard/product page works.
- [ ] Product site is updated and deployed.
- [ ] Legal/risk copy is approved.
- [ ] Marketing posts/assets are ready and accurate.
- [ ] Ops monitoring is active.
- [ ] Rollback plan is documented.
- [ ] End-to-end smoke test passes.
- [ ] Go/no-go decision is recorded.

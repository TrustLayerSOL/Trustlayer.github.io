import { toFeeRoutingViewModel } from "./fee-routing-view-model.js";
import { toScannerViewModel } from "./scanner-view-model.js";

const tabButtons = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll("[data-panel]");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    tabButtons.forEach((item) => item.classList.toggle("active", item === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === tab));
  });
});

const cycleTimer = document.querySelector("#overview .data-card:nth-child(2) strong");
let seconds = 3 * 3600 + 42 * 60 + 18;

function renderTimer() {
  if (!cycleTimer) return;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  cycleTimer.textContent = [hours, minutes, secs]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  seconds = seconds > 0 ? seconds - 1 : 0;
}

renderTimer();
setInterval(renderTimer, 1000);

const scannerForm = document.querySelector("[data-scanner-form]");
const scannerMint = document.querySelector("[data-scanner-mint]");
const scannerNetwork = document.querySelector("[data-scanner-network]");
const scannerResult = document.querySelector("[data-scanner-result]");
const feeRoutingResult = document.querySelector("[data-fee-routing-result]");
const scannerConnection = document.querySelector("[data-scanner-connection]");
const exampleMintButtons = document.querySelectorAll("[data-example-mint]");
const clearScannerButton = document.querySelector("[data-clear-scanner]");
const scannerSubmitButton = scannerForm?.querySelector('button[type="submit"]');
let activeScanRequestId = 0;
let activeScanController = null;
let activeScanKey = null;

const scannerApiBase =
  window.TRUSTLAYER_SCANNER_API_URL ||
  import.meta.env.VITE_TRUSTLAYER_SCANNER_API_URL ||
  localStorage.getItem("trustlayerScannerApiUrl") ||
  "http://127.0.0.1:8787";
const isLocalScannerApi = scannerApiBase.includes("127.0.0.1") || scannerApiBase.includes("localhost");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shortAddress(value) {
  if (!value || value.length < 12) return value || "none";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function setScannerConnection(label, variant = "watch") {
  if (!scannerConnection) return;

  scannerConnection.className = `status-pill ${variant}`.trim();
  scannerConnection.textContent = label;
}

function setScannerControlsDisabled(disabled) {
  if (scannerSubmitButton) scannerSubmitButton.disabled = disabled;
  exampleMintButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function renderScannerEmpty() {
  if (!scannerResult) return;

  scannerResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill">Awaiting scan</span>
      <h3>No mint checked yet.</h3>
      <p>
        ${isLocalScannerApi
          ? `Run the scanner API locally with <code>npm run scanner:serve</code> from <code>trustlayer-core</code>.`
          : "Paste a mint address to check it against the hosted TrustLayer scanner API."}
      </p>
    </div>
  `;
  setScannerConnection(isLocalScannerApi ? "Local API" : "Hosted API", "watch");
  renderFeeRoutingEmpty();
}

function renderScannerLoading(mint) {
  if (!scannerResult) return;

  scannerResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill watch">Scanning</span>
      <h3>Checking ${escapeHtml(shortAddress(mint))}</h3>
      <p>Reading mint authorities, token program, default account state, and Token-2022 extensions.</p>
    </div>
  `;
  renderFeeRoutingLoading(mint);
}

function renderScannerError(message) {
  if (!scannerResult) return;

  scannerResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill danger">Scanner unavailable</span>
      <h3>Could not complete the scan.</h3>
      <p>${escapeHtml(message)}</p>
      <p>
        ${isLocalScannerApi
          ? `Local testing requires <code>npm run scanner:serve</code> in <code>trustlayer-core</code>.`
          : "The hosted scanner API did not return a usable response. Try again shortly."}
      </p>
    </div>
  `;
  setScannerConnection("Offline", "danger");
}

function renderScannerResult(payload) {
  if (!scannerResult) return;

  const viewModel = toScannerViewModel(payload);

  if (viewModel.state === "error") {
    renderScannerError(viewModel.message);
    return;
  }

  setScannerConnection("Connected", "good");

  scannerResult.innerHTML = `
    <div class="scanner-verdict ${viewModel.verdictClass}">
      <span class="status-pill ${viewModel.statusVariant}">
        ${viewModel.statusLabel}
      </span>
      <h3>${escapeHtml(viewModel.headline)}</h3>
      <p>${escapeHtml(viewModel.body)}</p>
    </div>

    <div class="scanner-facts">
      <article>
        <small>Mint</small>
        <strong>${escapeHtml(shortAddress(viewModel.mint))}</strong>
        <span>${escapeHtml(viewModel.network)}</span>
      </article>
      <article>
        <small>Token program</small>
        <strong>${escapeHtml(viewModel.tokenProgram)}</strong>
        <span>${escapeHtml(viewModel.tokenProgramHint)}</span>
      </article>
      <article>
        <small>Mint authority</small>
        <strong>${viewModel.mintAuthorityPresent ? "Present" : "Disabled"}</strong>
        <span>${escapeHtml(shortAddress(viewModel.mintAuthority))}</span>
      </article>
      <article>
        <small>Freeze authority</small>
        <strong>${viewModel.freezeAuthorityPresent ? "Present" : "Disabled"}</strong>
        <span>${escapeHtml(shortAddress(viewModel.freezeAuthority))}</span>
      </article>
    </div>

    <div class="scanner-detail-grid">
      <div>
        <small>Hard-block reasons</small>
        ${
          viewModel.hardBlockLabels.length
            ? `<ul>${viewModel.hardBlockLabels.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>No hard-block token controls detected by this scanner pass.</p>`
        }
      </div>
      <div>
        <small>Extensions detected</small>
        ${
          viewModel.extensions.length
            ? `<ul>${viewModel.extensions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>No Token-2022 extensions detected.</p>`
        }
      </div>
    </div>

    <p class="scanner-disclaimer">
      TrustLayer scans token mechanics only. It does not guarantee project behavior, market price,
      liquidity, rewards, or protection outcomes.
    </p>
  `;
}

function renderFeeRoutingEmpty() {
  if (!feeRoutingResult) return;

  feeRoutingResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill">Awaiting route check</span>
      <h3>Fee routing not checked yet.</h3>
      <p>Run a mint scan to check the Pump.fun fee-sharing route status for the same token.</p>
    </div>
  `;
}

function renderFeeRoutingLoading(mint) {
  if (!feeRoutingResult) return;

  feeRoutingResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill watch">Checking route</span>
      <h3>Checking ${escapeHtml(shortAddress(mint))}</h3>
      <p>Reading fee-sharing route evidence and TrustLayer recipient configuration.</p>
    </div>
  `;
}

function renderFeeRoutingError(message) {
  if (!feeRoutingResult) return;

  feeRoutingResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill danger">Route check unavailable</span>
      <h3>Could not complete the fee-route check.</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function renderFeeRoutingResult(payload) {
  if (!feeRoutingResult) return;

  const viewModel = toFeeRoutingViewModel(payload);
  const verdictClass =
    viewModel.variant === "danger" ? "rejected" : viewModel.variant === "good" ? "verified" : "pending";
  const checks = viewModel.checks.length
    ? `<ul>${viewModel.checks
        .map(
          (item) =>
            `<li>${escapeHtml(item.label || item.code || "Check")} - ${item.passed ? "passed" : "not passed"}</li>`,
        )
        .join("")}</ul>`
    : `<p>No decoded route checks are available for this status.</p>`;

  feeRoutingResult.innerHTML = `
    <div class="scanner-verdict ${verdictClass}">
      <span class="status-pill ${viewModel.variant}">${escapeHtml(viewModel.label)}</span>
      <h3>${escapeHtml(viewModel.headline)}</h3>
      <p>${escapeHtml(viewModel.body)}</p>
    </div>

    <div class="scanner-facts fee-routing-facts">
      <article>
        <small>Integration</small>
        <strong>${escapeHtml(viewModel.integration)}</strong>
        <span>${escapeHtml(viewModel.network)}</span>
      </article>
      <article>
        <small>Route account</small>
        <strong>${escapeHtml(shortAddress(viewModel.routeAddress))}</strong>
        <span>${viewModel.routeAddress ? "evidence found" : "none"}</span>
      </article>
      <article>
        <small>Allocation</small>
        <strong>${viewModel.allocationBps == null ? "Pending" : `${escapeHtml(viewModel.allocationBps)} bps`}</strong>
        <span>decoded route share</span>
      </article>
      <article>
        <small>Authority</small>
        <strong>${escapeHtml(viewModel.authorityStatus || "Pending")}</strong>
        <span>lock status</span>
      </article>
    </div>

    <div class="scanner-detail-grid">
      <div>
        <small>Expected recipient</small>
        <p>${escapeHtml(shortAddress(viewModel.expectedRecipient))}</p>
      </div>
      <div>
        <small>Route checks</small>
        ${checks}
      </div>
    </div>

    <p class="scanner-disclaimer">
      Fee routing approval checks only configured route evidence. It does not guarantee project
      behavior, market price, liquidity, rewards, or protection outcomes.
    </p>
  `;
}

async function scanToken(mint, network, signal) {
  const url = new URL(`/api/scanner/token-safety/${mint}`, scannerApiBase);
  url.searchParams.set("network", network);

  const response = await fetch(url.toString(), { signal });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Scanner returned HTTP ${response.status}.`);
  }

  return payload;
}

async function checkFeeRouting(mint, network, signal) {
  const url = new URL(`/api/fee-routing/pumpfun/${mint}`, scannerApiBase);
  url.searchParams.set("network", network);

  const response = await fetch(url.toString(), { signal });
  const payload = await response.json().catch(() => null);

  if (!payload) {
    throw new Error(`Fee-route checker returned HTTP ${response.status}.`);
  }

  return payload;
}

scannerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const mint = scannerMint?.value.trim();
  const network = scannerNetwork?.value || "mainnet-beta";

  if (!mint) {
    renderScannerError("Paste a Solana mint address before scanning.");
    return;
  }

  const scanKey = `${network}:${mint}`;
  if (activeScanKey === scanKey) return;

  renderScannerLoading(mint);
  activeScanController?.abort();
  const requestId = activeScanRequestId + 1;
  activeScanRequestId = requestId;
  activeScanController = new AbortController();
  activeScanKey = scanKey;
  setScannerControlsDisabled(true);

  try {
    const [scannerOutcome, feeRoutingOutcome] = await Promise.allSettled([
      scanToken(mint, network, activeScanController.signal),
      checkFeeRouting(mint, network, activeScanController.signal),
    ]);
    if (requestId !== activeScanRequestId) return;

    if (scannerOutcome.status === "fulfilled") {
      renderScannerResult(scannerOutcome.value);
    } else {
      renderScannerError(
        scannerOutcome.reason instanceof Error ? scannerOutcome.reason.message : "Unknown scanner error.",
      );
    }

    if (feeRoutingOutcome.status === "fulfilled") {
      renderFeeRoutingResult(feeRoutingOutcome.value);
    } else {
      renderFeeRoutingError(
        feeRoutingOutcome.reason instanceof Error
          ? feeRoutingOutcome.reason.message
          : "Unknown fee-route checker error.",
      );
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    if (requestId !== activeScanRequestId) return;
    renderScannerError(error instanceof Error ? error.message : "Unknown scanner error.");
  } finally {
    if (requestId === activeScanRequestId) {
      activeScanKey = null;
      setScannerControlsDisabled(false);
    }
  }
});

exampleMintButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (scannerMint) scannerMint.value = button.dataset.exampleMint || "";
    scannerForm?.requestSubmit();
  });
});

clearScannerButton?.addEventListener("click", () => {
  activeScanRequestId += 1;
  activeScanController?.abort();
  activeScanKey = null;
  setScannerControlsDisabled(false);
  if (scannerMint) scannerMint.value = "";
  renderScannerEmpty();
});

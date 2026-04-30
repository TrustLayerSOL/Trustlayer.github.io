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
const scannerConnection = document.querySelector("[data-scanner-connection]");
const exampleMintButtons = document.querySelectorAll("[data-example-mint]");
const clearScannerButton = document.querySelector("[data-clear-scanner]");
let activeScanRequestId = 0;
let activeScanController = null;

const scannerApiBase =
  window.TRUSTLAYER_SCANNER_API_URL ||
  import.meta.env.VITE_TRUSTLAYER_SCANNER_API_URL ||
  localStorage.getItem("trustlayerScannerApiUrl") ||
  "http://127.0.0.1:8787";

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

function renderScannerEmpty() {
  if (!scannerResult) return;

  scannerResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill">Awaiting scan</span>
      <h3>No mint checked yet.</h3>
      <p>
        Run the scanner API locally with <code>npm run scanner:serve</code> from
        <code>trustlayer-core</code>. Production API hosting is the next deployment step.
      </p>
    </div>
  `;
  setScannerConnection("Local API", "watch");
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
}

function renderScannerError(message) {
  if (!scannerResult) return;

  scannerResult.innerHTML = `
    <div class="scanner-empty">
      <span class="status-pill danger">Scanner unavailable</span>
      <h3>Could not complete the scan.</h3>
      <p>${escapeHtml(message)}</p>
      <p>
        Local testing requires <code>npm run scanner:serve</code> in
        <code>trustlayer-core</code>. A hosted scanner API is required before public production scans.
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

scannerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const mint = scannerMint?.value.trim();
  const network = scannerNetwork?.value || "mainnet-beta";

  if (!mint) {
    renderScannerError("Paste a Solana mint address before scanning.");
    return;
  }

  renderScannerLoading(mint);
  activeScanController?.abort();
  const requestId = activeScanRequestId + 1;
  activeScanRequestId = requestId;
  activeScanController = new AbortController();

  try {
    const payload = await scanToken(mint, network, activeScanController.signal);
    if (requestId !== activeScanRequestId) return;
    renderScannerResult(payload);
  } catch (error) {
    if (error?.name === "AbortError") return;
    if (requestId !== activeScanRequestId) return;
    renderScannerError(error instanceof Error ? error.message : "Unknown scanner error.");
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
  if (scannerMint) scannerMint.value = "";
  renderScannerEmpty();
});

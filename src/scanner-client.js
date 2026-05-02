export async function fetchScannerPayload({
  scannerApiBase,
  mint,
  network,
  signal,
  fetchFn = fetch,
}) {
  const url = new URL(`/api/scanner/token-safety/${mint}`, scannerApiBase);
  url.searchParams.set("network", network);

  const response = await fetchFn(url.toString(), { signal });
  const payload = await response.json().catch(() => null);

  if (!response.ok && !payload) {
    throw new Error(`Scanner returned HTTP ${response.status}.`);
  }

  return payload;
}

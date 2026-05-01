export async function loadReceiptManifest({
  apiBase,
  projectId = "receipts-demo",
  fallbackPath = "/data/receipts-demo-manifest.json",
  fetchJson = defaultFetchJson,
} = {}) {
  const apiUrl = buildManifestApiUrl(apiBase, projectId);

  if (apiUrl) {
    try {
      const payload = await fetchJson(apiUrl);
      const manifest = payload?.manifest || payload;
      if (manifest?.manifestVersion) {
        return {
          source: "api",
          payload,
          manifest,
        };
      }
      throw new Error("Manifest API returned no manifest.");
    } catch (error) {
      const fallback = await fetchJson(fallbackPath);
      return {
        source: "static",
        payload: fallback,
        manifest: fallback?.manifest || fallback,
        apiError: error,
      };
    }
  }

  const fallback = await fetchJson(fallbackPath);
  return {
    source: "static",
    payload: fallback,
    manifest: fallback?.manifest || fallback,
  };
}

export function buildManifestApiUrl(apiBase, projectId = "receipts-demo") {
  if (!apiBase) return null;
  const base = String(apiBase).replace(/\/+$/, "");
  const project = encodeURIComponent(projectId);
  return `${base}/api/projects/${project}/manifests/latest`;
}

async function defaultFetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request returned HTTP ${response.status}.`);
  }
  return payload;
}

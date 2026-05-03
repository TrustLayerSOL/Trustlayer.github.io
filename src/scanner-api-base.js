export const HOSTED_SCANNER_API_BASE = "https://trustlayer-scanner-api.vercel.app";
export const LOCAL_SCANNER_API_BASE = "http://127.0.0.1:8787";

export function resolveScannerApiBase({
  windowOverride,
  envOverride,
  storedOverride,
  hostname,
} = {}) {
  if (windowOverride) return windowOverride;
  if (envOverride) return envOverride;
  if (storedOverride) return storedOverride;
  if (isTrustLayerHost(hostname)) return HOSTED_SCANNER_API_BASE;
  return LOCAL_SCANNER_API_BASE;
}

function isTrustLayerHost(hostname) {
  return hostname === "trustlayer.fun" || hostname === "www.trustlayer.fun";
}

import { createHash } from "node:crypto";

export function createManifestHash(manifest) {
  const canonical = JSON.stringify(stripGeneratedFields(manifest));
  return createHash("sha256").update(canonical).digest("hex");
}

export function verifyManifestHash(manifest) {
  if (!manifest.manifestHash) {
    return {
      ok: false,
      expected: createManifestHash(manifest),
      actual: null,
    };
  }

  const expected = createManifestHash(manifest);

  return {
    ok: expected === manifest.manifestHash,
    expected,
    actual: manifest.manifestHash,
  };
}

function stripGeneratedFields(manifest) {
  const { manifestHash, generatedAt, ...canonical } = manifest;
  return canonical;
}

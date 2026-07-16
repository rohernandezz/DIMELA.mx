/**
 * Emit mock profiles JSON for Worker /api/search (mock-first until D1).
 * Run via: node --experimental-strip-types scripts/emit-mock-profiles.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_PROFILES } from "../src/data/mockProfiles";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "data", "profiles.json");

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(MOCK_PROFILES, null, 2)}\n`);
console.log(`Wrote ${MOCK_PROFILES.length} profiles → ${out}`);

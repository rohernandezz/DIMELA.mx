/**
 * Build-time helper: read emitted profiles.json for getStaticPaths.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type PathProfile = { slug: string };

export function readEmittedProfiles(): PathProfile[] {
  const path = join(process.cwd(), "public", "data", "profiles.json");
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as PathProfile[];
    return Array.isArray(raw) ? raw.filter((p) => p?.slug) : [];
  } catch {
    return [];
  }
}

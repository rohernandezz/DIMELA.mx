/**
 * Load published profiles for client pages (API first, profiles.json fallback).
 */
import type { SearchableProfile } from "./search";

async function loadProfilesJson(): Promise<SearchableProfile[]> {
  const res = await fetch("/data/profiles.json");
  if (!res.ok) throw new Error("profiles.json unavailable");
  return (await res.json()) as SearchableProfile[];
}

function isJsonResponse(res: Response) {
  return (res.headers.get("content-type") || "").includes("application/json");
}

export async function fetchSearchResults(
  params: URLSearchParams = new URLSearchParams(),
): Promise<SearchableProfile[]> {
  try {
    const res = await fetch(`/api/search?${params}`);
    if (!isJsonResponse(res) || !res.ok) throw new Error(`search ${res.status}`);
    const data = (await res.json()) as { ok?: boolean; results?: SearchableProfile[] };
    if (!data.ok || !Array.isArray(data.results)) throw new Error("bad search");
    return data.results;
  } catch {
    return loadProfilesJson();
  }
}

export async function fetchProfile(slug: string): Promise<SearchableProfile | null> {
  try {
    const res = await fetch(`/api/profile?slug=${encodeURIComponent(slug)}`);
    // Astro dev has no Worker — /api/* is an HTML 404. Fall through to profiles.json.
    if (!isJsonResponse(res)) throw new Error("api unavailable");

    const data = (await res.json()) as { ok?: boolean; profile?: SearchableProfile };
    if (res.status === 404 || data.ok === false) return null;
    if (!res.ok || !data.profile) throw new Error(`profile ${res.status}`);
    return data.profile;
  } catch {
    try {
      const profiles = await loadProfilesJson();
      return profiles.find((p) => p.slug === slug) ?? null;
    } catch {
      return null;
    }
  }
}

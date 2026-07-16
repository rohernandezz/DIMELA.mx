/**
 * Load published profiles for client pages (API first, profiles.json fallback).
 */
import type { SearchableProfile } from "./search";

export async function fetchSearchResults(
  params: URLSearchParams = new URLSearchParams(),
): Promise<SearchableProfile[]> {
  try {
    const res = await fetch(`/api/search?${params}`);
    if (!res.ok) throw new Error(`search ${res.status}`);
    const data = (await res.json()) as { ok?: boolean; results?: SearchableProfile[] };
    if (!data.ok || !Array.isArray(data.results)) throw new Error("bad search");
    return data.results;
  } catch {
    const res = await fetch("/data/profiles.json");
    if (!res.ok) throw new Error("profiles.json unavailable");
    return (await res.json()) as SearchableProfile[];
  }
}

export async function fetchProfile(slug: string): Promise<SearchableProfile | null> {
  try {
    const res = await fetch(`/api/profile?slug=${encodeURIComponent(slug)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`profile ${res.status}`);
    const data = (await res.json()) as { ok?: boolean; profile?: SearchableProfile };
    if (!data.ok || !data.profile) throw new Error("bad profile");
    return data.profile;
  } catch {
    const res = await fetch("/data/profiles.json");
    if (!res.ok) return null;
    const profiles = (await res.json()) as SearchableProfile[];
    return profiles.find((p) => p.slug === slug) ?? null;
  }
}

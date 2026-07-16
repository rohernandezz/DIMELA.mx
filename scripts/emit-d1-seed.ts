/**
 * Emit db/seed.sql from mock profiles (published rows for D1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MOCK_PROFILES } from "../src/data/mockProfiles";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "db", "seed.sql");

function sqlStr(value: string | null | undefined): string {
  if (value == null) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

const lines = [
  "-- Auto-generated from src/data/mockProfiles.ts — do not edit by hand",
  "DELETE FROM profile_publications;",
  "DELETE FROM profiles;",
  "",
];

for (const p of MOCK_PROFILES) {
  const customCss = p.customCss?.trim() ? sqlStr(p.customCss) : "NULL";
  const customFonts = p.customFonts?.length ? sqlStr(JSON.stringify(p.customFonts)) : "'[]'";
  const tags = sqlStr(JSON.stringify(p.tags ?? []));
  lines.push(
    `INSERT INTO profiles (slug, name, estado, servicios, tags, description, website, tier, featured, cover, avatar, custom_css, custom_fonts, status) VALUES (${[
      sqlStr(p.slug),
      sqlStr(p.name),
      sqlStr(p.estado),
      sqlStr(JSON.stringify(p.servicios)),
      tags,
      sqlStr(p.description),
      sqlStr(p.website ?? null),
      sqlStr(p.tier),
      p.featured ? "1" : "0",
      sqlStr(p.cover),
      sqlStr(p.avatar),
      customCss,
      customFonts,
      sqlStr("published"),
    ].join(", ")});`,
  );
}

lines.push(
  "",
  `INSERT INTO profile_publications (
  slug, name, estado, servicios, tags, description, website, tier, featured,
  cover, avatar, custom_css, custom_fonts, galleries
)
SELECT
  slug, name, estado, servicios, tags, description, website, tier, featured,
  cover, avatar, custom_css, custom_fonts, galleries
FROM profiles
WHERE status = 'published';`,
  "",
);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${MOCK_PROFILES.length} INSERT rows → ${out}`);

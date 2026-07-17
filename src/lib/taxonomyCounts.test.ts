import { describe, expect, it } from "vitest";
import type { SearchableProfile } from "./search";
import { countByEstado, countByServicio } from "./taxonomyCounts";

const profiles: SearchableProfile[] = [
  {
    slug: "a",
    name: "A",
    estado: "Jalisco",
    servicios: ["Lettering", "Branding"],
    description: "",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "b",
    name: "B",
    estado: "Jalisco",
    servicios: ["Lettering"],
    description: "",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "c",
    name: "C",
    estado: "Ciudad de México",
    servicios: ["Branding"],
    description: "",
    tier: "pro",
    cover: null,
    avatar: null,
  },
];

describe("countByEstado", () => {
  it("counts profiles per estado and includes zero rows", () => {
    const rows = countByEstado(profiles);
    expect(rows.find((r) => r.label === "Jalisco")).toMatchObject({
      slug: "jalisco",
      count: 2,
    });
    expect(rows.find((r) => r.label === "Ciudad de México")).toMatchObject({
      slug: "cdmx",
      count: 1,
    });
    expect(rows.find((r) => r.label === "Oaxaca")?.count).toBe(0);
  });
});

describe("countByServicio", () => {
  it("counts servicio memberships", () => {
    const rows = countByServicio(profiles);
    expect(rows.find((r) => r.label === "Lettering")?.count).toBe(2);
    expect(rows.find((r) => r.label === "Branding")?.count).toBe(2);
    expect(rows.find((r) => r.label === "Caligrafía")?.count).toBe(0);
  });
});

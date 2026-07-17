import { describe, expect, it } from "vitest";
import { filterProfiles, parseSearchParams, type SearchableProfile } from "./search";

const profiles: SearchableProfile[] = [
  {
    slug: "a",
    name: "Ana Lettering",
    estado: "Jalisco",
    servicios: ["Lettering", "Branding"],
    description: "<p>Especialista en lettering</p>",
    tier: "free",
    cover: null,
    avatar: null,
  },
  {
    slug: "b",
    name: "Bruno Tipografía",
    estado: "Ciudad de México",
    servicios: ["Diseño de Tipografía"],
    description: "<p>Fuentes y branding tipográfico</p>",
    tier: "pro",
    cover: null,
    avatar: null,
  },
];

describe("parseSearchParams", () => {
  it("parses q and comma-separated filters", () => {
    const params = new URLSearchParams(
      "q=letra&servicio=Lettering,Branding&estado=Jalisco",
    );
    expect(parseSearchParams(params)).toEqual({
      q: "letra",
      servicio: ["Lettering", "Branding"],
      estado: ["Jalisco"],
    });
  });

  it("trims empty segments", () => {
    expect(parseSearchParams(new URLSearchParams("servicio=,%20Lettering,"))).toEqual({
      q: "",
      servicio: ["Lettering"],
      estado: [],
    });
  });
});

describe("filterProfiles", () => {
  it("filters by text query against name and bio", () => {
    expect(filterProfiles(profiles, { q: "lettering", servicio: [], estado: [] }).map((p) => p.slug)).toEqual([
      "a",
    ]);
  });

  it("filters by servicio (any match)", () => {
    expect(
      filterProfiles(profiles, { q: "", servicio: ["Branding"], estado: [] }).map((p) => p.slug),
    ).toEqual(["a"]);
  });

  it("filters by estado", () => {
    expect(
      filterProfiles(profiles, {
        q: "",
        servicio: [],
        estado: ["Ciudad de México"],
      }).map((p) => p.slug),
    ).toEqual(["b"]);
  });

  it("combines filters with AND", () => {
    expect(
      filterProfiles(profiles, {
        q: "tipograf",
        servicio: ["Diseño de Tipografía"],
        estado: ["Ciudad de México"],
      }).map((p) => p.slug),
    ).toEqual(["b"]);
  });
});

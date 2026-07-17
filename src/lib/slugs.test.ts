import { describe, expect, it } from "vitest";
import {
  estadoFromSlug,
  estadoSlug,
  servicioFromSlug,
  servicioSlug,
  slugFromName,
  toSlug,
} from "./slugs";

describe("toSlug / slugFromName", () => {
  it("strips accents and lowercases", () => {
    expect(toSlug("Querétaro")).toBe("queretaro");
    expect(slugFromName("Romina Hernández")).toBe("romina-hernandez");
  });

  it("collapses non-alphanumeric runs", () => {
    expect(toSlug("  Foo---Bar  ")).toBe("foo-bar");
  });
});

describe("estadoSlug / estadoFromSlug", () => {
  it("uses short public slugs for CDMX and Edomex", () => {
    expect(estadoSlug("Ciudad de México")).toBe("cdmx");
    expect(estadoSlug("Estado de México")).toBe("edomex");
  });

  it("round-trips short and legacy slugs", () => {
    expect(estadoFromSlug("cdmx")).toBe("Ciudad de México");
    expect(estadoFromSlug("ciudad-de-mexico")).toBe("Ciudad de México");
    expect(estadoFromSlug("edomex")).toBe("Estado de México");
    expect(estadoFromSlug("jalisco")).toBe("Jalisco");
  });
});

describe("servicioSlug / servicioFromSlug", () => {
  it("round-trips servicio labels", () => {
    expect(servicioSlug("Lettering")).toBe("lettering");
    expect(servicioFromSlug("diseno-de-tipografia")).toBe("Diseño de Tipografía");
  });
});

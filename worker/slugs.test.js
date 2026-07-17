import { describe, expect, it } from "vitest";
import { normalizeSlug, slugFromName } from "./slugs.js";

describe("slugFromName", () => {
  it("mirrors client toSlug behavior", () => {
    expect(slugFromName("Romina Hernández")).toBe("romina-hernandez");
    expect(slugFromName("Querétaro")).toBe("queretaro");
  });
});

describe("normalizeSlug", () => {
  it("lowercases and collapses invalid chars", () => {
    expect(normalizeSlug(" Foo_Bar!! ")).toBe("foo-bar");
    expect(normalizeSlug("already-ok")).toBe("already-ok");
  });
});

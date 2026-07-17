import { describe, expect, it } from "vitest";
import {
  bioLeadHtml,
  bioLeadPlainText,
  bioPlainText,
  renderBioHtml,
  sanitizeBioHtml,
} from "./bio";

describe("sanitizeBioHtml", () => {
  it("strips script tags and event handlers", () => {
    expect(sanitizeBioHtml(`<p onclick="alert(1)">ok</p><script>evil()</script>`)).toBe(
      "<p>ok</p>",
    );
  });

  it("strips strong/em/b/i tags", () => {
    expect(sanitizeBioHtml("<p><strong>bold</strong> <em>italic</em></p>")).toBe(
      "<p>bold italic</p>",
    );
  });
});

describe("bioPlainText", () => {
  it("flattens tags to readable text", () => {
    expect(bioPlainText("<p>Hola</p><p>mundo</p>")).toBe("Hola mundo");
  });
});

describe("bioLeadHtml / bioLeadPlainText", () => {
  it("returns the first paragraph", () => {
    expect(bioLeadHtml("<p>Lead</p><p>Rest</p>")).toBe("<p>Lead</p>");
    expect(bioLeadPlainText("<p>Lead</p><p>Rest</p>")).toBe("Lead");
  });

  it("wraps legacy plain text", () => {
    expect(bioLeadHtml("Solo texto")).toBe("<p>Solo texto</p>");
  });
});

describe("renderBioHtml", () => {
  it("sanitizes HTML bios and escapes plain text", () => {
    expect(renderBioHtml("<p>Hola</p>")).toBe("<p>Hola</p>");
    expect(renderBioHtml("a < b")).toBe("<p>a &lt; b</p>");
  });
});

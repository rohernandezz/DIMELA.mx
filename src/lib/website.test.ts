import { describe, expect, it } from "vitest";
import { websiteHref, websiteLabel } from "./website";

describe("websiteHref", () => {
  it("adds https when missing", () => {
    expect(websiteHref("example.com")).toBe("https://example.com");
  });

  it("keeps existing protocol", () => {
    expect(websiteHref("http://example.com/path")).toBe("http://example.com/path");
    expect(websiteHref("https://example.com")).toBe("https://example.com");
  });

  it("returns empty for blank", () => {
    expect(websiteHref("  ")).toBe("");
  });
});

describe("websiteLabel", () => {
  it("shows host and path without protocol", () => {
    expect(websiteLabel("https://example.com/work/")).toBe("example.com/work");
  });

  it("omits trailing slash on root", () => {
    expect(websiteLabel("https://example.com/")).toBe("example.com");
  });
});

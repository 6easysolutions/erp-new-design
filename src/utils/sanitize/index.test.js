/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./index.js";

describe("Security: HTML Sanitizer (XSS Mitigation)", () => {
  it("strips malicious <script> tags and scripts", () => {
    const dirty = '<script>alert("XSS")</script><p>Product Description</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).toContain("<p>Product Description</p>");
  });

  it("removes inline event handlers like onerror, onload, onclick", () => {
    const dirty = '<img src="invalid.jpg" onerror="alert(1)" /><a href="#" onclick="stealData()">Click</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("stealData");
    expect(clean).toContain('<img src="invalid.jpg">');
  });

  it("blocks javascript: URI schemes in href and src attributes", () => {
    const dirty = '<a href="javascript:alert(1)">Malicious Link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).toBe("<a>Malicious Link</a>");
  });

  it("blocks malicious iframe, object, and embed elements", () => {
    const dirty = '<iframe src="https://attacker.com"></iframe><object data="malicious.swf"></object><embed src="malicious.swf">';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<iframe");
    expect(clean).not.toContain("<object");
    expect(clean).not.toContain("<embed");
  });

  it("preserves safe HTML tags and formatting", () => {
    const safeHtml = "<h3>Overview</h3><p>This is a <strong>great</strong> product with <em>rich</em> features.</p><ul><li>Feature 1</li><li>Feature 2</li></ul>";
    const clean = sanitizeHtml(safeHtml);
    expect(clean).toBe(safeHtml);
  });

  it("handles empty or non-string inputs gracefully", () => {
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
  });
});

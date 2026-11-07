/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

describe('ProductView Security - HTML Sanitization', () => {
  it('strips malicious <script> tags from description HTML', () => {
    const dirty = '<script>alert("XSS")</script><p>Product Description</p>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert');
    expect(clean).toBe('<p>Product Description</p>');
  });

  it('removes inline event handlers like onerror, onload, onclick', () => {
    const dirty = '<img src="invalid.jpg" onerror="alert(1)" /><a href="#" onclick="stealData()">Click</a>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('stealData');
  });

  it('blocks javascript: URI schemes in href and src attributes', () => {
    const dirty = '<a href="javascript:alert(1)">Malicious Link</a>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('javascript:');
  });

  it('blocks malicious iframe and object embedding', () => {
    const dirty = '<iframe src="https://attacker.com"></iframe><object data="malicious.swf"></object>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<iframe');
    expect(clean).not.toContain('<object');
  });

  it('preserves safe HTML tags and formatting', () => {
    const safeHtml = '<h3>Overview</h3><p>This is a <strong>great</strong> product with <em>rich</em> features.</p><ul><li>Feature 1</li><li>Feature 2</li></ul>';
    const clean = DOMPurify.sanitize(safeHtml);
    expect(clean).toBe(safeHtml);
  });
});

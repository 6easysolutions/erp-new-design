/**
 * Security Utility: HTML Sanitizer
 *
 * Sanitizes untrusted HTML strings to prevent Cross-Site Scripting (XSS)
 * by safely parsing HTML via browser DOMParser and stripping potentially dangerous
 * tags (e.g., <script>, <iframe>, <object>, <embed>), inline JavaScript event
 * handlers (e.g., onload, onerror, onclick), and malicious URI schemes (e.g. javascript:).
 */

const BLOCKED_TAGS = new Set([
  "script", "iframe", "object", "embed", "style", "link", "meta", "base", "form", "applet"
]);

/**
 * Sanitizes an HTML string to mitigate XSS (Cross-Site Scripting) vulnerabilities.
 * Uses browser DOMParser when available, falling back to stripping all tags.
 *
 * @param {string} html - Untrusted HTML input string
 * @returns {string} Sanitized HTML safe for rendering
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== "string" || !html) {
    return "";
  }

  if (typeof DOMParser === "undefined") {
    return html.replace(/<[^>]*>?/gm, "");
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const cleanNode = (node) => {
      // Remove dangerous elements
      if (node.tagName && BLOCKED_TAGS.has(node.tagName.toLowerCase())) {
        node.remove();
        return;
      }

      // Check and sanitize attributes on element nodes (Node.ELEMENT_NODE === 1)
      if (node.nodeType === 1 && node.attributes) {
        const attrsToRemove = [];
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          const attrName = attr.name.toLowerCase();
          const attrValue = attr.value.trim().toLowerCase();

          // Block inline event handlers (onerror, onload, onclick, etc.)
          if (attrName.startsWith("on")) {
            attrsToRemove.push(attr.name);
          }
          // Block javascript:, vbscript:, and data: HTML URIs
          else if (
            (attrName === "href" || attrName === "src" || attrName === "action" || attrName === "data") &&
            (attrValue.startsWith("javascript:") || attrValue.startsWith("vbscript:") || attrValue.startsWith("data:text/html"))
          ) {
            attrsToRemove.push(attr.name);
          }
        }

        attrsToRemove.forEach((attr) => node.removeAttribute(attr));
      }

      // Recursively clean children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        cleanNode(child);
      }
    };

    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch (err) {
    console.error("HTML sanitization error:", err);
    return "";
  }
};

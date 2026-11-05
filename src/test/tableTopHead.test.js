import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("TableTopHead component includes accessible labels, roles, and descriptions", () => {
  const filePath = path.resolve("src/components/table-top-head/index.jsx");
  const content = fs.readFileSync(filePath, "utf-8");

  // Verify accessible labels on all icon-only action links
  assert.match(
    content,
    /aria-label="Export as PDF"/,
    "Should provide an accessible label for the PDF export link"
  );
  assert.match(
    content,
    /aria-label="Export as Excel"/,
    "Should provide an accessible label for the Excel export link"
  );
  assert.match(
    content,
    /aria-label="Refresh table data"/,
    "Should provide an accessible label for the Refresh link"
  );
  assert.match(
    content,
    /aria-label=\{toggleHeader \? "Expand header" : "Collapse header"\}/,
    "Should dynamically announce collapse/expand state for the header toggle"
  );

  // Verify informative image alt texts
  assert.match(
    content,
    /alt="PDF export icon"/,
    "PDF image should have a descriptive alt attribute"
  );
  assert.match(
    content,
    /alt="Excel export icon"/,
    "Excel image should have a descriptive alt attribute"
  );

  // Verify aria-expanded and role attributes on toggle button
  assert.match(
    content,
    /aria-expanded=\{!toggleHeader\}/,
    "Collapse/expand button should communicate expanded state"
  );
  assert.match(
    content,
    /role="button"/,
    "Collapse/expand Link element should expose a button role"
  );
});

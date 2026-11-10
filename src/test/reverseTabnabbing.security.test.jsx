import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security: Reverse Tabnabbing Mitigation', () => {
  it('protects window.open in ThemeSettings with noopener,noreferrer', () => {
    const filePath = path.resolve('src/components/layouts/themeSettings.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("window.open(");
    expect(content).toContain('"noopener,noreferrer"');
  });

  const filesToCheck = [
    'src/feature-module/uiinterface/icons/tablericon.jsx',
    'src/feature-module/uiinterface/icons/bootstrapicons.jsx',
    'src/feature-module/uiinterface/icons/remixIcons.jsx',
    'src/feature-module/uiinterface/forms/formelements/layouts/form-validation.jsx',
  ];

  filesToCheck.forEach((relPath) => {
    it(`ensures target="_blank" has rel="noopener noreferrer" in ${relPath}`, () => {
      const filePath = path.resolve(relPath);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('target="_blank"');
      expect(content).toContain('rel="noopener noreferrer"');
    });
  });

  it('scans codebase to ensure no external target="_blank" link lacks rel="noopener noreferrer"', () => {
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== 'assets') {
            files = files.concat(scanDir(fullPath));
          }
        } else if (/\.(jsx|tsx|html|js)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const allSourceFiles = scanDir(path.resolve('src'));
    const linkRegex = /<[a-zA-Z]+[^>]*target=["']_blank["'][^>]*>/g;

    for (const file of allSourceFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(linkRegex);
      if (matches) {
        for (const match of matches) {
          expect(match).toContain('rel=');
          expect(match).toContain('noopener');
        }
      }
    }
  });
});

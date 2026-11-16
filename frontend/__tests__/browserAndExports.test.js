const fs = require('fs');
const path = require('path');

describe('Browser field and Exports map validation (Issue #23)', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  it('points browser field to valid built frontend entry point', () => {
    expect(pkg.browser).toBe('./dist/frontend/index.js');
    expect(pkg.browser).not.toBe('./dist/index.mjs');
  });

  it('defines valid exports map for Vite, Next.js, and Webpack', () => {
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['./backend']).toBeDefined();
    expect(pkg.exports['./frontend']).toBeDefined();
    expect(pkg.exports['./package.json']).toBe('./package.json');
  });

  it('ensures all target files referenced in package.json exist after build', () => {
    const mainTarget = path.resolve(rootDir, pkg.main);
    const moduleTarget = path.resolve(rootDir, pkg.module);
    const browserTarget = path.resolve(rootDir, pkg.browser);

    expect(fs.existsSync(mainTarget)).toBe(true);
    expect(fs.existsSync(moduleTarget)).toBe(true);
    expect(fs.existsSync(browserTarget)).toBe(true);
  });

  it('keeps files field clean and scoped to distribution artifacts', () => {
    expect(pkg.files).toContain('dist/');
    expect(pkg.files).toContain('README.md');
    expect(pkg.files).toContain('LICENSE');
    expect(pkg.files).not.toContain('frontend/index.js');
  });
});

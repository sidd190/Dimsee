const fs = require('fs');
const path = require('path');

describe('Dual-package ESM/CJS exports conditions (Issue #50)', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  it('declares valid exports map with root, backend, frontend, and package.json', () => {
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
    expect(pkg.exports['./backend']).toBeDefined();
    expect(pkg.exports['./frontend']).toBeDefined();
    expect(pkg.exports['./package.json']).toBe('./package.json');
  });

  it('orders conditions correctly with import preceding require and default fallback', () => {
    ['.', './backend', './frontend'].forEach((subpath) => {
      const entry = pkg.exports[subpath];
      const keys = Object.keys(entry);
      expect(keys).toContain('import');
      expect(keys).toContain('require');
      expect(keys).toContain('default');

      const importIdx = keys.indexOf('import');
      const requireIdx = keys.indexOf('require');
      const defaultIdx = keys.indexOf('default');

      expect(importIdx).toBeLessThan(requireIdx);
      expect(requireIdx).toBeLessThan(defaultIdx);
    });
  });

  it('resolves correct targets for backend dual-package exports', () => {
    const backendExports = pkg.exports['./backend'];
    expect(backendExports.import).toBe('./dist/backend/index.js');
    expect(backendExports.require).toBe('./dist/backend/index.js');
    expect(backendExports.default).toBe('./dist/backend/index.js');

    const backendPath = path.resolve(rootDir, backendExports.require);
    expect(fs.existsSync(backendPath)).toBe(true);
  });

  it('resolves correct targets for frontend dual-package exports', () => {
    const frontendExports = pkg.exports['./frontend'];
    expect(frontendExports.import).toBe('./dist/frontend/index.js');
    expect(frontendExports.require).toBe('./dist/frontend/index.js');
    expect(frontendExports.default).toBe('./dist/frontend/index.js');

    const frontendPath = path.resolve(rootDir, frontendExports.import);
    expect(fs.existsSync(frontendPath)).toBe(true);
  });

  it('resolves root export conditions cleanly for both ESM and CJS consumers', () => {
    const rootExports = pkg.exports['.'];
    expect(rootExports.import).toBe('./dist/frontend/index.js');
    expect(rootExports.require).toBe('./dist/backend/index.js');
    expect(rootExports.default).toBe('./dist/backend/index.js');
  });
});

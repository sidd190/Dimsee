const fs = require('fs');
const path = require('path');

describe('Node engine floor and CI configuration (Issue #48)', () => {
  it('specifies node engine >=18.0.0 in package.json', () => {
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBe('>=18.0.0');
  });

  it('updates GitHub CI workflow matrix to include Node 18 LTS floor', () => {
    const ciPath = path.resolve(__dirname, '../../.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf8');

    expect(ciContent).toContain('node: [18, 20, 22]');
  });
});

const fs = require('fs');
const path = require('path');

describe('Security audit configuration and documentation (Issue #40)', () => {
  const rootDir = path.resolve(__dirname, '../..');

  it('configures npm audit script in package.json', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    expect(pkg.scripts.audit).toBeDefined();
    expect(pkg.scripts.audit).toContain('npm audit');
  });

  it('includes security audit step in GitHub Actions CI workflow', () => {
    const ciPath = path.join(rootDir, '.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf8');

    expect(ciContent).toContain('Dependency security audit');
    expect(ciContent).toContain('npm run audit');
  });

  it('documents dependency auditing and triaged advisories in SECURITY.md', () => {
    const secPath = path.join(rootDir, 'SECURITY.md');
    const secContent = fs.readFileSync(secPath, 'utf8');

    expect(secContent).toContain('Dependency Auditing & Known Advisories');
    expect(secContent).toContain('GHSA-gcqx-w48m-w2h4');
    expect(secContent).toContain('GHSA-mrhx-c7xc-m3w5');
  });
});

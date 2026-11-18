const { checkJwtSecrets } = require('../backend/audit/checks/jwtSecrets');
const { audit } = require('../backend/audit');

describe('audit check: distinct access and refresh JWT secrets (Issue #73)', () => {
  test('flags when access and refresh secrets are identical', () => {
    const config = {
      jwtSecret: 'super-secret-key-12345',
      jwtRefreshSecret: 'super-secret-key-12345'
    };

    const findings = checkJwtSecrets(config, { env: 'development' });
    const identicalFinding = findings.find(f => f.id === 'jwt-secrets-identical');

    expect(identicalFinding).toBeDefined();
    expect(identicalFinding.severity).toBe('warn');
    expect(identicalFinding.message).toContain('share the same secret key');
  });

  test('escalates to error severity in production environment', () => {
    const config = {
      jwtSecret: 'super-secret-key-12345',
      jwtRefreshSecret: 'super-secret-key-12345'
    };

    const findings = checkJwtSecrets(config, { env: 'production' });
    const identicalFinding = findings.find(f => f.id === 'jwt-secrets-identical');

    expect(identicalFinding.severity).toBe('error');
  });

  test('flags default/placeholder secrets', () => {
    const config = {
      jwtSecret: 'your-secret-key-change-in-production',
      jwtRefreshSecret: 'different-custom-secret'
    };

    const findings = checkJwtSecrets(config, { env: 'production' });
    const defaultFinding = findings.find(f => f.id === 'jwt-secret-default');

    expect(defaultFinding).toBeDefined();
    expect(defaultFinding.severity).toBe('error');
    expect(defaultFinding.remediation).toBeDefined();
  });

  test('flags missing secrets', () => {
    const findings = checkJwtSecrets({}, { env: 'production' });

    expect(findings.some(f => f.id === 'jwt-secret-missing')).toBe(true);
    expect(findings.some(f => f.id === 'jwt-refresh-secret-missing')).toBe(true);
  });

  test('passes cleanly when distinct, non-default secrets are provided', () => {
    const config = {
      jwtSecret: 'random-access-secret-32-chars-long-abc',
      jwtRefreshSecret: 'random-refresh-secret-32-chars-long-xyz'
    };

    const findings = checkJwtSecrets(config, { env: 'production' });
    expect(findings.length).toBe(0);

    const report = audit(config, { env: 'production' });
    expect(report.passed).toBe(true);
    expect(report.counts.error).toBe(0);
  });
});

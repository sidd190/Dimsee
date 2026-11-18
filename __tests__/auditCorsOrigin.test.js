const { checkCorsOrigin } = require('../backend/audit/checks/corsOrigin');
const { audit } = require('../backend/audit');

describe('audit check: no wildcard CORS origin in production (Issue #74)', () => {
  test('flags wildcard origin ("*") as error in production', () => {
    const findings = checkCorsOrigin({ corsOrigin: '*' }, { env: 'production' });
    const wildcardFinding = findings.find(f => f.id === 'cors-origin-wildcard');

    expect(wildcardFinding).toBeDefined();
    expect(wildcardFinding.severity).toBe('error');
    expect(wildcardFinding.message).toContain('Wildcard origins');
  });

  test('flags wildcard origin as warning in development', () => {
    const findings = checkCorsOrigin({ corsOrigin: '*' }, { env: 'development' });
    const wildcardFinding = findings.find(f => f.id === 'cors-origin-wildcard');

    expect(wildcardFinding).toBeDefined();
    expect(wildcardFinding.severity).toBe('warn');
  });

  test('flags missing CORS origin as error in production', () => {
    const findings = checkCorsOrigin({}, { env: 'production' });
    const missingFinding = findings.find(f => f.id === 'cors-origin-missing');

    expect(missingFinding).toBeDefined();
    expect(missingFinding.severity).toBe('error');
  });

  test('flags insecure non-HTTPS origin in production', () => {
    const findings = checkCorsOrigin(
      { corsOrigin: 'http://my-insecure-site.com' },
      { env: 'production' }
    );
    const insecureFinding = findings.find(f => f.id === 'cors-origin-insecure-http');

    expect(insecureFinding).toBeDefined();
    expect(insecureFinding.severity).toBe('error');
  });

  test('passes cleanly when an explicit HTTPS origin is configured in production', () => {
    const config = {
      jwtSecret: 'prod-access-secret-32-chars-long-1',
      jwtRefreshSecret: 'prod-refresh-secret-32-chars-long-2',
      corsOrigin: 'https://app.example.com'
    };

    const findings = checkCorsOrigin(config, { env: 'production' });
    expect(findings.length).toBe(0);

    const report = audit(config, { env: 'production' });
    expect(report.passed).toBe(true);
    expect(report.counts.error).toBe(0);
  });
});

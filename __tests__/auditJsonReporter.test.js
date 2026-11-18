const { formatJsonReport } = require('../backend/audit/reporters/json');
const { audit } = require('../backend/audit');

describe('auth.audit() JSON reporter (Issue #78)', () => {
  const mockReport = {
    passed: false,
    timestamp: '2026-11-18T12:00:00.000Z',
    counts: { error: 1, warn: 1, info: 0 },
    findings: [
      {
        id: 'jwt-secrets-identical',
        rule: 'distinct-jwt-secrets',
        severity: 'error',
        title: 'Access and refresh token JWT secrets are identical',
        message: 'jwtSecret and jwtRefreshSecret share the same secret key.',
        remediation: 'Use distinct, independent secret keys.'
      }
    ]
  };

  test('formats audit findings as valid, parseable JSON', () => {
    const jsonStr = formatJsonReport(mockReport);
    expect(typeof jsonStr).toBe('string');

    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.tool).toBe('dimsee-audit');
    expect(parsed.status).toBe('failed');
    expect(parsed.passed).toBe(false);
    expect(parsed.summary.errors).toBe(1);
    expect(parsed.findings.length).toBe(1);
    expect(parsed.findings[0].id).toBe('jwt-secrets-identical');
  });

  test('supports compact non-pretty JSON output', () => {
    const jsonStr = formatJsonReport(mockReport, { pretty: false });
    expect(jsonStr).not.toContain('\n');
    expect(JSON.parse(jsonStr).tool).toBe('dimsee-audit');
  });

  test('audit({ format: "json" }) returns machine-readable JSON output', () => {
    const jsonStr = audit({
      jwtSecret: 'prod-access-secret-32-chars-long-1',
      jwtRefreshSecret: 'prod-refresh-secret-32-chars-long-2',
      corsOrigin: 'https://app.example.com'
    }, { format: 'json', env: 'production' });

    expect(typeof jsonStr).toBe('string');
    const parsed = JSON.parse(jsonStr);
    expect(parsed.status).toBe('passed');
    expect(parsed.passed).toBe(true);
    expect(parsed.summary.errors).toBe(0);
  });
});

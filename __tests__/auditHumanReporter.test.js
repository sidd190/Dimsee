const { formatHumanReport } = require('../backend/audit/reporters/human');
const { audit } = require('../backend/audit');

describe('auth.audit() human-readable reporter (Issue #77)', () => {
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
      },
      {
        id: 'cors-origin-wildcard',
        rule: 'no-wildcard-cors',
        severity: 'warn',
        title: 'Wildcard CORS origin detected',
        message: 'corsOrigin is configured with a wildcard ("*").',
        remediation: 'Replace wildcard with exact domains.'
      }
    ]
  };

  test('formats a readable console report with findings and badges', () => {
    const text = formatHumanReport(mockReport, { colors: false });

    expect(text).toContain('DIMSEE SECURITY POSTURE AUDIT REPORT');
    expect(text).toContain('Status:    FAILED');
    expect(text).toContain('1 error(s)');
    expect(text).toContain('1 warning(s)');
    expect(text).toContain('[ERROR] Access and refresh token JWT secrets are identical');
    expect(text).toContain('[WARN] Wildcard CORS origin detected');
    expect(text).toContain('Remediation: Use distinct, independent secret keys.');
  });

  test('formats clean report when all checks pass', () => {
    const cleanReport = {
      passed: true,
      counts: { error: 0, warn: 0, info: 0 },
      findings: []
    };

    const text = formatHumanReport(cleanReport, { colors: false });
    expect(text).toContain('Status:    PASSED');
    expect(text).toContain('No security posture findings detected');
  });

  test('audit({ format: "human" }) returns formatted string directly', () => {
    const formatted = audit({
      jwtSecret: 'secret-a-32-chars-minimum-prod-key',
      jwtRefreshSecret: 'secret-b-32-chars-minimum-prod-key',
      corsOrigin: 'https://example.com'
    }, { format: 'human', colors: false });

    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('DIMSEE SECURITY POSTURE AUDIT REPORT');
  });
});

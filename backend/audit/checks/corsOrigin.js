// backend/audit/checks/corsOrigin.js
'use strict';

/**
 * Check: no wildcard CORS origin in production (Issue #74).
 * Flags a wildcard ('*') or missing corsOrigin while in production.
 */
function checkCorsOrigin(config = {}, context = {}) {
  const findings = [];
  const corsOrigin = config.corsOrigin || process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
  const isProduction = (context.env === 'production' || process.env.NODE_ENV === 'production');

  // Check 1: Missing CORS origin in production
  if (!corsOrigin) {
    findings.push({
      id: 'cors-origin-missing',
      rule: 'no-wildcard-cors',
      severity: isProduction ? 'error' : 'warn',
      title: 'Missing CORS origin configuration',
      message: 'corsOrigin is not specified. In production, exact frontend origins must be pinned.',
      remediation: 'Configure an explicit origin URL via config.corsOrigin or process.env.CORS_ORIGIN.'
    });
    return findings;
  }

  // Check 2: Wildcard CORS origin
  const normalized = Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin];

  const hasWildcard = normalized.some(origin => origin === '*' || origin === '*.*');
  if (hasWildcard) {
    findings.push({
      id: 'cors-origin-wildcard',
      rule: 'no-wildcard-cors',
      severity: isProduction ? 'error' : 'warn',
      title: 'Wildcard CORS origin detected',
      message: 'corsOrigin is configured with a wildcard ("*"). Wildcard origins combined with credentials allow credential theft and violate cross-origin security.',
      remediation: 'Replace wildcard ("*") with exact frontend domain origins (e.g. "https://app.example.com").'
    });
  }

  // Check 3: Localhost or insecure HTTP in production
  if (isProduction) {
    const hasInsecureOrigin = normalized.some(origin => {
      if (typeof origin !== 'string') return false;
      const lower = origin.toLowerCase();
      return lower.startsWith('http://') && !lower.includes('localhost') && !lower.includes('127.0.0.1');
    });

    if (hasInsecureOrigin) {
      findings.push({
        id: 'cors-origin-insecure-http',
        rule: 'no-wildcard-cors',
        severity: 'error',
        title: 'Insecure HTTP origin in production CORS configuration',
        message: 'Non-HTTPS CORS origin configured in production environment.',
        remediation: 'Ensure all production CORS origins use HTTPS ("https://...").'
      });
    }

    const hasLocalhostInProd = normalized.some(origin => {
      if (typeof origin !== 'string') return false;
      const lower = origin.toLowerCase();
      return lower.includes('localhost') || lower.includes('127.0.0.1');
    });

    if (hasLocalhostInProd) {
      findings.push({
        id: 'cors-origin-localhost-in-production',
        rule: 'no-wildcard-cors',
        severity: 'warn',
        title: 'Localhost CORS origin in production',
        message: 'corsOrigin includes localhost or 127.0.0.1 in a production environment.',
        remediation: 'Remove localhost/127.0.0.1 origins from production configurations.'
      });
    }
  }

  return findings;
}

module.exports = {
  checkCorsOrigin
};

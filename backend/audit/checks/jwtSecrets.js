// backend/audit/checks/jwtSecrets.js
'use strict';

const KNOWN_INSECURE_SECRETS = new Set([
  'your-secret-key-change-in-production',
  'your-jwt-secret-key-change-in-production',
  'your-jwt-refresh-secret-key-change-in-production',
  'your-secret-key',
  'your-jwt-secret',
  'secret',
  'jwtsecret',
  'changeme',
  '123456'
]);

/**
 * Check: distinct access and refresh JWT secrets (Issue #73).
 * Flags when jwtSecret and jwtRefreshSecret are equal or left at their defaults.
 */
function checkJwtSecrets(config = {}, context = {}) {
  const findings = [];
  const jwtSecret = config.jwtSecret || process.env.JWT_SECRET;
  const jwtRefreshSecret = config.jwtRefreshSecret || process.env.JWT_REFRESH_SECRET;
  const isProduction = (context.env === 'production' || process.env.NODE_ENV === 'production');

  // Check 1: Missing secrets
  if (!jwtSecret) {
    findings.push({
      id: 'jwt-secret-missing',
      rule: 'distinct-jwt-secrets',
      severity: isProduction ? 'error' : 'warn',
      title: 'Missing access token JWT secret',
      message: 'jwtSecret is not configured. A high-entropy random secret must be provided.',
      remediation: 'Provide a strong random string via process.env.JWT_SECRET or config.jwtSecret.'
    });
  }

  if (!jwtRefreshSecret) {
    findings.push({
      id: 'jwt-refresh-secret-missing',
      rule: 'distinct-jwt-secrets',
      severity: isProduction ? 'error' : 'warn',
      title: 'Missing refresh token JWT secret',
      message: 'jwtRefreshSecret is not configured. Separate secrets must be used for access and refresh tokens.',
      remediation: 'Provide a strong random string via process.env.JWT_REFRESH_SECRET or config.jwtRefreshSecret.'
    });
  }

  // Check 2: Default or placeholder secrets
  if (jwtSecret && KNOWN_INSECURE_SECRETS.has(jwtSecret.trim().toLowerCase())) {
    findings.push({
      id: 'jwt-secret-default',
      rule: 'distinct-jwt-secrets',
      severity: isProduction ? 'error' : 'warn',
      title: 'Default/insecure JWT secret in use',
      message: `jwtSecret is using a known default placeholder ("${jwtSecret}").`,
      remediation: 'Generate a high-entropy secret (e.g. node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))").'
    });
  }

  if (jwtRefreshSecret && KNOWN_INSECURE_SECRETS.has(jwtRefreshSecret.trim().toLowerCase())) {
    findings.push({
      id: 'jwt-refresh-secret-default',
      rule: 'distinct-jwt-secrets',
      severity: isProduction ? 'error' : 'warn',
      title: 'Default/insecure JWT refresh secret in use',
      message: `jwtRefreshSecret is using a known default placeholder ("${jwtRefreshSecret}").`,
      remediation: 'Generate a distinct high-entropy secret for refresh tokens.'
    });
  }

  // Check 3: Reused / identical access and refresh secrets
  if (jwtSecret && jwtRefreshSecret && jwtSecret === jwtRefreshSecret) {
    findings.push({
      id: 'jwt-secrets-identical',
      rule: 'distinct-jwt-secrets',
      severity: isProduction ? 'error' : 'warn',
      title: 'Access and refresh token JWT secrets are identical',
      message: 'jwtSecret and jwtRefreshSecret share the same secret key. Compromising one compromises both token types.',
      remediation: 'Use distinct, independent secret keys for access tokens and refresh tokens.'
    });
  }

  return findings;
}

module.exports = {
  checkJwtSecrets,
  KNOWN_INSECURE_SECRETS
};

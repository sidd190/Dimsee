// backend/audit/index.js
'use strict';

const { checkJwtSecrets } = require('./checks/jwtSecrets');
const { checkCorsOrigin } = require('./checks/corsOrigin');
const { formatHumanReport } = require('./reporters/human');
const { formatJsonReport } = require('./reporters/json');

/**
 * Registry of available audit checks.
 */
const CHECKS = [
  checkJwtSecrets,
  checkCorsOrigin
];

/**
 * Runs security audit on a Dimsee configuration or running app instance.
 * @param {Object} input - Dimsee configuration object or Express app with app.locals.authConfig
 * @param {Object} [options] - Audit options
 * @param {string} [options.format] - Output format: 'raw' (default), 'human', or 'json'
 * @returns {Object|string} Audit report object or formatted string
 */
function audit(input = {}, options = {}) {
  let config = input;
  if (input && input.locals && input.locals.authConfig) {
    config = input.locals.authConfig;
  }

  const env = options.env || process.env.NODE_ENV || 'development';
  const findings = [];

  for (const check of CHECKS) {
    const checkResult = check(config, { env, ...options });
    if (checkResult) {
      if (Array.isArray(checkResult)) {
        findings.push(...checkResult);
      } else {
        findings.push(checkResult);
      }
    }
  }

  const passed = findings.every(f => f.severity !== 'error');
  const counts = {
    error: findings.filter(f => f.severity === 'error').length,
    warn: findings.filter(f => f.severity === 'warn').length,
    info: findings.filter(f => f.severity === 'info').length
  };

  const rawReport = {
    passed,
    counts,
    findings,
    timestamp: new Date().toISOString()
  };

  if (options.format === 'human') {
    return formatHumanReport(rawReport, options);
  }

  if (options.format === 'json') {
    return formatJsonReport(rawReport, options);
  }

  return rawReport;
}

module.exports = {
  audit,
  CHECKS,
  checkJwtSecrets,
  checkCorsOrigin,
  formatHumanReport,
  formatJsonReport
};

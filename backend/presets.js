// backend/presets.js
'use strict';

const crypto = require('crypto');

const PROTOTYPE_WARNING_BANNER = [
  '********************************************************************************',
  '* [DIMSEE WARNING] PROTOTYPE PRESET ACTIVE                                     *',
  '* - In-process / development defaults are enabled                              *',
  '* - Sessions and memory store are ephemeral                                    *',
  '* - DO NOT USE THIS PRESET IN PRODUCTION                                       *',
  '********************************************************************************'
].join('\n');

/**
 * Applies preset defaults and configurations.
 * @param {Object} rawConfig - User provided configuration
 * @returns {Object} { config: Object, preset: string, warnings: string[] }
 */
function applyPreset(rawConfig = {}) {
  const { preset, ...rest } = rawConfig;
  const warnings = [];

  if (!preset) {
    return {
      preset: null,
      config: rawConfig,
      warnings
    };
  }

  const normalizedPreset = String(preset).toLowerCase().trim();

  if (normalizedPreset === 'prototype') {
    warnings.push(PROTOTYPE_WARNING_BANNER);

    // Loud console warning as mandated by issue #82
    if (process.env.NODE_ENV !== 'test') {
      console.warn('\n' + PROTOTYPE_WARNING_BANNER + '\n');
    }

    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[DIMSEE CRITICAL SECURITY WARNING] Running prototype preset in NODE_ENV=production is strongly discouraged!'
      );
    }

    const prototypeConfig = {
      preset: 'prototype',
      isPrototype: true,
      mongoUri: rest.mongoUri || process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dimsee-prototype',
      jwtSecret: rest.jwtSecret || process.env.JWT_SECRET || 'dimsee-prototype-insecure-jwt-secret-' + crypto.randomBytes(8).toString('hex'),
      jwtRefreshSecret: rest.jwtRefreshSecret || process.env.JWT_REFRESH_SECRET || 'dimsee-prototype-refresh-secret-' + crypto.randomBytes(8).toString('hex'),
      jwtExpiry: rest.jwtExpiry || '1h',
      jwtRefreshExpiry: rest.jwtRefreshExpiry || '7d',
      corsOrigin: rest.corsOrigin || process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
      cookieMaxAge: rest.cookieMaxAge || 24 * 60 * 60 * 1000, // 1 day
      enableOAuth: rest.enableOAuth || false,
      oauth: rest.oauth || {},
      useMemorySession: rest.useMemorySession !== false, // default in-memory for fastest zero-setup prototype
      ...rest
    };

    return {
      preset: 'prototype',
      config: prototypeConfig,
      warnings
    };
  }

  throw new Error(`[DIMSEE] Unknown preset: "${preset}". Supported presets: "prototype".`);
}

module.exports = {
  applyPreset,
  PROTOTYPE_WARNING_BANNER
};

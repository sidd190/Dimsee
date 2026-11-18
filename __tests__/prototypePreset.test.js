const { applyPreset, PROTOTYPE_WARNING_BANNER } = require('../backend/presets');
const { createAuthBackend } = require('../backend');

describe('Prototype Preset (Issue #82)', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('applies prototype preset with in-process defaults and warning banner', () => {
    const { preset, config, warnings } = applyPreset({ preset: 'prototype' });

    expect(preset).toBe('prototype');
    expect(config.isPrototype).toBe(true);
    expect(config.useMemorySession).toBe(true);
    expect(config.jwtSecret).toBeDefined();
    expect(config.jwtSecret.length).toBeGreaterThan(10);
    expect(config.mongoUri).toContain('mongodb://');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('PROTOTYPE PRESET ACTIVE');
    expect(warnings[0]).toContain('DO NOT USE THIS PRESET IN PRODUCTION');
  });

  test('allows overriding individual prototype defaults', () => {
    const customUri = 'mongodb://localhost:27017/custom-proto';
    const { config } = applyPreset({
      preset: 'prototype',
      mongoUri: customUri,
      cookieMaxAge: 12345
    });

    expect(config.mongoUri).toBe(customUri);
    expect(config.cookieMaxAge).toBe(12345);
    expect(config.isPrototype).toBe(true);
  });

  test('throws descriptive error on unknown preset', () => {
    expect(() => {
      applyPreset({ preset: 'invalid-tier' });
    }).toThrow('[DIMSEE] Unknown preset: "invalid-tier"');
  });

  test('createAuthBackend attaches preset and warnings to app.locals.authConfig', () => {
    const app = createAuthBackend({
      preset: 'prototype',
      connectMongo: false
    });

    expect(app.locals.authConfig).toBeDefined();
    expect(app.locals.authConfig.preset).toBe('prototype');
    expect(app.locals.authConfig.warnings).toContain(PROTOTYPE_WARNING_BANNER);
  });

  test('logs critical warning in production NODE_ENV', () => {
    process.env.NODE_ENV = 'production';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    applyPreset({ preset: 'prototype' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DIMSEE CRITICAL SECURITY WARNING]')
    );

    consoleErrorSpy.mockRestore();
  });
});

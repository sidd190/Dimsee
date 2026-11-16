const fs = require('fs');
const path = require('path');

describe('Unified Babel Configuration (Issue #21)', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const babelConfigFn = require('../../babel.config.js');

  it('consolidates babel configs into babel.config.js and removes obsolete json files', () => {
    expect(fs.existsSync(path.join(rootDir, 'babel.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'babel.config.json'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, 'babel.config.backend.json'))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, 'babel.config.frontend.json'))).toBe(false);
  });

  it('provides CommonJS preset for backend environment', () => {
    const mockApi = {
      env: (name) => name === 'backend',
      cache: jest.fn()
    };
    const config = babelConfigFn(mockApi);
    expect(config.presets).toEqual([
      ['@babel/preset-env', { modules: 'commonjs' }]
    ]);
  });

  it('provides ESM and React presets for frontend environment', () => {
    const mockApi = {
      env: (name) => name === 'frontend',
      cache: jest.fn()
    };
    const config = babelConfigFn(mockApi);
    expect(config.presets).toEqual([
      ['@babel/preset-env', { modules: false }],
      '@babel/preset-react'
    ]);
  });

  it('configures path-based overrides as fallback when environment is not specified', () => {
    const mockApi = {
      env: () => false,
      cache: jest.fn()
    };
    const config = babelConfigFn(mockApi);
    expect(config.overrides).toBeDefined();
    expect(config.overrides.length).toBe(2);
  });
});

const fs = require('fs');
const path = require('path');

describe('llms.txt specification integrity', () => {
  const rootDir = path.resolve(__dirname, '..');
  const llmsPath = path.join(rootDir, 'llms.txt');

  test('llms.txt exists in the repository root and is populated', () => {
    expect(fs.existsSync(llmsPath)).toBe(true);
    const content = fs.readFileSync(llmsPath, 'utf8');
    expect(content.length).toBeGreaterThan(300);
  });

  test('llms.txt adheres to markdown structure and links primary documentation', () => {
    const content = fs.readFileSync(llmsPath, 'utf8');

    // Headers & Sections
    expect(content).toContain('# Dimsee');
    expect(content).toContain('## Core Documentation');
    expect(content).toContain('## Core API Reference');
    expect(content).toContain('## Guidance for AI Code Generators and Agents');

    // Document links
    expect(content).toContain('[README.md](README.md)');
    expect(content).toContain('[CUSTOMIZATION.md](CUSTOMIZATION.md)');
    expect(content).toContain('[CONTRIBUTING.md](CONTRIBUTING.md)');
    expect(content).toContain('[SECURITY.md](SECURITY.md)');
    expect(content).toContain('[VISION.md](VISION.md)');
  });

  test('llms.txt provides backend and frontend code examples', () => {
    const content = fs.readFileSync(llmsPath, 'utf8');
    expect(content).toContain('createAuthBackend');
    expect(content).toContain('authMiddleware');
    expect(content).toContain('AuthProvider');
    expect(content).toContain('AuthForm');
    expect(content).toContain('AuthStatus');
  });

  test('referenced documentation files actually exist in the repository', () => {
    const content = fs.readFileSync(llmsPath, 'utf8');
    const docLinks = [
      'README.md',
      'CUSTOMIZATION.md',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'VISION.md',
      'CHANGELOG.md'
    ];

    for (const docFile of docLinks) {
      if (content.includes(`(${docFile})`)) {
        expect(fs.existsSync(path.join(rootDir, docFile))).toBe(true);
      }
    }
  });
});

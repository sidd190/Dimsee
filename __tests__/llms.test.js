const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('LLM documentation dump generation', () => {
  const rootDir = path.resolve(__dirname, '..');
  const llmsPath = path.join(rootDir, 'llms.txt');
  const llmsFullPath = path.join(rootDir, 'llms-full.txt');

  test('llms.txt and llms-full.txt exist and are non-empty', () => {
    expect(fs.existsSync(llmsPath)).toBe(true);
    expect(fs.existsSync(llmsFullPath)).toBe(true);

    const llmsContent = fs.readFileSync(llmsPath, 'utf8');
    const llmsFullContent = fs.readFileSync(llmsFullPath, 'utf8');

    expect(llmsContent.length).toBeGreaterThan(500);
    expect(llmsFullContent.length).toBeGreaterThan(llmsContent.length);
  });

  test('llms-full.txt contains sections for key documentation files', () => {
    const content = fs.readFileSync(llmsFullPath, 'utf8');
    expect(content).toContain('README.md');
    expect(content).toContain('CUSTOMIZATION.md');
    expect(content).toContain('CONTRIBUTING.md');
    expect(content).toContain('SECURITY.md');
    expect(content).toContain('VISION.md');
  });

  test('generate-llms script runs cleanly without errors', () => {
    expect(() => {
      execSync('node scripts/generate-llms.js', { cwd: rootDir, stdio: 'pipe' });
    }).not.toThrow();
  });
});

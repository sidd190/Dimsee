const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn()
}));
jest.mock('../src/components/AuthForm.css', () => ({}));

const useAuth = require('../src/hooks/useAuth').default;
const AuthForm = require('../src/components/AuthForm').default;

describe('AuthForm accessibility and unique form instance IDs', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      signup: jest.fn(),
      signin: jest.fn(),
      loading: false,
      apiUrl: 'http://localhost:5000/api/auth'
    });
  });

  it('renders two signup forms without duplicate input IDs and with matching label htmlFor targets', () => {
    const html = renderToStaticMarkup(
      React.createElement('div', null,
        React.createElement(AuthForm, { mode: 'signup' }),
        React.createElement(AuthForm, { mode: 'signup' })
      )
    );

    // Extract all input IDs
    const idMatches = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map(m => m[1]);
    expect(idMatches.length).toBe(8); // 4 inputs per signup form * 2 forms

    // Ensure all 8 IDs are unique (no duplicate IDs)
    const uniqueIds = new Set(idMatches);
    expect(uniqueIds.size).toBe(8);

    // Extract all label for attributes
    const forMatches = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
    expect(forMatches.length).toBe(8);

    // Verify every label htmlFor matches an input id in the same render
    for (const forAttr of forMatches) {
      expect(uniqueIds.has(forAttr)).toBe(true);
    }

    // Split HTML by form to inspect each form instance independently
    const formHtmls = html.split('</form>');
    expect(formHtmls.length).toBeGreaterThanOrEqual(2);

    const form1Inputs = [...formHtmls[0].matchAll(/<input[^>]*id="([^"]+)"/g)].map(m => m[1]);
    const form1Labels = [...formHtmls[0].matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
    expect(form1Inputs).toEqual(form1Labels);

    const form2Inputs = [...formHtmls[1].matchAll(/<input[^>]*id="([^"]+)"/g)].map(m => m[1]);
    const form2Labels = [...formHtmls[1].matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
    expect(form2Inputs).toEqual(form2Labels);

    // Verify Form 2 labels DO NOT target Form 1 inputs
    for (const form2Label of form2Labels) {
      expect(form1Inputs).not.toContain(form2Label);
    }
  });

  it('renders two signin forms without duplicate input IDs', () => {
    const html = renderToStaticMarkup(
      React.createElement('div', null,
        React.createElement(AuthForm, { mode: 'signin' }),
        React.createElement(AuthForm, { mode: 'signin' })
      )
    );

    const idMatches = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map(m => m[1]);
    expect(idMatches.length).toBe(4); // 2 inputs (email, password) * 2 forms

    const uniqueIds = new Set(idMatches);
    expect(uniqueIds.size).toBe(4);

    const forMatches = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
    expect(forMatches).toEqual(idMatches);
  });

  it('supports explicit id prop for deterministic prefixes', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuthForm, { mode: 'signup', id: 'custom-signup' })
    );

    expect(html).toContain('id="custom-signup-username"');
    expect(html).toContain('for="custom-signup-username"');
    expect(html).toContain('id="custom-signup-email"');
    expect(html).toContain('for="custom-signup-email"');
    expect(html).toContain('id="custom-signup-password"');
    expect(html).toContain('for="custom-signup-password"');
    expect(html).toContain('id="custom-signup-confirmPassword"');
    expect(html).toContain('for="custom-signup-confirmPassword"');
  });

  it('falls back gracefully to unique stable IDs when React.useId is unavailable (React < 18 compatibility)', () => {
    const originalUseId = React.useId;
    try {
      // Simulate React 16.8 / 17 by removing React.useId
      delete React.useId;

      const html = renderToStaticMarkup(
        React.createElement('div', null,
          React.createElement(AuthForm, { mode: 'signup' }),
          React.createElement(AuthForm, { mode: 'signup' })
        )
      );

      const idMatches = [...html.matchAll(/<input[^>]*id="([^"]+)"/g)].map(m => m[1]);
      expect(idMatches.length).toBe(8);

      const uniqueIds = new Set(idMatches);
      expect(uniqueIds.size).toBe(8);

      const forMatches = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(m => m[1]);
      expect(forMatches.length).toBe(8);

      for (const forAttr of forMatches) {
        expect(uniqueIds.has(forAttr)).toBe(true);
      }
    } finally {
      React.useId = originalUseId;
    }
  });
});

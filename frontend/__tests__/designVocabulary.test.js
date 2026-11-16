const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    user: { _id: 'u1', username: 'testuser', email: 'test@example.com', hasPassword: false },
    signup: jest.fn(),
    signin: jest.fn(),
    signout: jest.fn(),
    setPassword: jest.fn(),
    loading: false,
    apiUrl: 'http://localhost:5000/api/auth'
  })
}));
jest.mock('../src/components/AuthForm.css', () => ({}));
jest.mock('../src/components/SetPasswordButton.css', () => ({}));
jest.mock('../src/components/AuthStatus.css', () => ({}));

const AuthForm = require('../src/components/AuthForm').default;
const LogoutButton = require('../src/components/LogoutButton').default;
const SetPasswordButton = require('../src/components/SetPasswordButton').default;
const AuthStatus = require('../src/components/AuthStatus').default;

const sharedDesigns = ['modern', 'minimal', 'colorful', 'outline', 'rounded'];

describe('Unified design-token vocabulary across components', () => {
  describe.each(sharedDesigns)('design: %s', (design) => {
    it(`AuthForm renders cleanly with design="${design}"`, () => {
      const html = renderToStaticMarkup(React.createElement(AuthForm, { design }));
      expect(html).toContain(`auth-container ${design}`);
    });

    it(`LogoutButton renders cleanly with design="${design}"`, () => {
      const html = renderToStaticMarkup(React.createElement(LogoutButton, { design }));
      expect(html).toContain('button');
      expect(html).toContain('Sign Out');
    });

    it(`SetPasswordButton renders cleanly with design="${design}"`, () => {
      const html = renderToStaticMarkup(React.createElement(SetPasswordButton, { design }));
      expect(html).toContain(`design-${design}`);
      expect(html).toContain('Set Password');
    });

    it(`AuthStatus renders cleanly with unified designs`, () => {
      const html = renderToStaticMarkup(
        React.createElement(AuthStatus, {
          formDesign: design,
          logoutDesign: design,
          setPasswordDesign: design
        })
      );
      expect(html).toBeDefined();
    });
  });
});

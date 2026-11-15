const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

jest.mock('../src/hooks/useAuth', () => ({
  __esModule: true, default: jest.fn()
}));
jest.mock('../src/components/SetPasswordButton.css', () => ({}));

const useAuth = require('../src/hooks/useAuth').default;
const SetPasswordButton = require('../src/components/SetPasswordButton').default;

describe('SetPasswordButton', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { hasPassword: false }, setPassword: jest.fn() });
  });

  it('shows a button before opening the form by default', () => {
    const html = renderToStaticMarkup(React.createElement(SetPasswordButton));
    expect(html).toContain('Set Password</button>');
    expect(html).not.toContain('<form');
  });

  it('shows the form inline without a close button when showPrompt is false', () => {
    const html = renderToStaticMarkup(React.createElement(SetPasswordButton, { showPrompt: false }));
    expect(html).toContain('set-password-inline');
    expect(html).toContain('<form');
    expect(html).toContain('name="confirmPassword"');
    expect(html).not.toContain('aria-label="Close"');
  });

  it.each([null, { hasPassword: true }])('hides the form for ineligible users: %j', (user) => {
    useAuth.mockReturnValue({ user });
    expect(renderToStaticMarkup(React.createElement(SetPasswordButton, { showPrompt: false }))).toBe('');
  });
});

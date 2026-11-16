const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

describe('AuthContext in-memory state and localStorage security', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    global.localStorage = localStorageMock;
    global.window = { localStorage: localStorageMock };
  });

  afterEach(() => {
    delete global.localStorage;
    delete global.window;
  });

  it('renders AuthProvider with in-memory user by default without writing to localStorage', () => {
    const AuthProvider = require('../src/context/AuthContext').default;
    const html = renderToStaticMarkup(
      React.createElement(AuthProvider, null, React.createElement('div', null, 'App Content'))
    );

    expect(html).toContain('App Content');
    // Ensure setItem was NOT called during initialization/default render
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});

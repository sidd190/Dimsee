const DimseeDocsServer = require('../scripts/mcp-server');

describe('Dimsee Docs MCP Server', () => {
  let server;

  beforeEach(() => {
    server = new DimseeDocsServer();
  });

  test('handles initialize handshake compliant with MCP specification', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0' }
      }
    });

    expect(response).toBeDefined();
    expect(response.id).toBe(1);
    expect(response.result.protocolVersion).toBe('2024-11-05');
    expect(response.result.serverInfo.name).toBe('dimsee-docs-mcp');
  });

  test('lists documentation resources', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'resources/list'
    });

    expect(response.result).toBeDefined();
    expect(response.result.resources.length).toBeGreaterThan(0);
    expect(response.result.resources.some(r => r.uri === 'dimsee://docs/readme')).toBe(true);
  });

  test('reads a documentation resource', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/read',
      params: { uri: 'dimsee://docs/readme' }
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents[0].text).toContain('# Dimsee');
  });

  test('returns error for invalid resource uri', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'resources/read',
      params: { uri: 'dimsee://docs/nonexistent' }
    });

    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(-32602);
  });

  test('lists available tools', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/list'
    });

    expect(response.result.tools.some(t => t.name === 'search_docs')).toBe(true);
    expect(response.result.tools.some(t => t.name === 'get_snippet')).toBe(true);
    expect(response.result.tools.some(t => t.name === 'list_snippets')).toBe(true);
  });

  test('executes search_docs tool call', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'search_docs',
        arguments: { query: 'createAuthBackend' }
      }
    });

    expect(response.result.content[0].type).toBe('text');
    const parsed = JSON.parse(response.result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test('executes list_snippets tool call', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: { name: 'list_snippets' }
    });

    const parsed = JSON.parse(response.result.content[0].text);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].id).toBe('backend-minimal');
  });

  test('executes get_snippet tool call', () => {
    const response = server.handleRequest({
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'get_snippet',
        arguments: { id: 'backend-minimal' }
      }
    });

    expect(response.result.content[0].text).toContain('createAuthBackend');
  });
});

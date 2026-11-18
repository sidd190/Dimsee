// __tests__/emailService.test.js
// Unit tests for EmailService and ConsoleTransport.

'use strict';

const { EmailService } = require('../backend/email/emailService');
const { EmailTransport } = require('../backend/email/transports/base');
const { ConsoleTransport } = require('../backend/email/transports/console');

// ── Helpers ──────────────────────────────────────────────────────────────────

class SpyTransport extends EmailTransport {
  constructor() {
    super();
    this.sent = [];
  }
  async send(opts) {
    this.sent.push(opts);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EmailTransport (base)', () => {
  it('throws when send() is not overridden', async () => {
    const t = new EmailTransport();
    await expect(t.send({ to: 'a@b.com', subject: 'Hi', html: '<p>Hi</p>' }))
      .rejects.toThrow('must implement send()');
  });
});

describe('ConsoleTransport', () => {
  it('extends EmailTransport', () => {
    expect(new ConsoleTransport()).toBeInstanceOf(EmailTransport);
  });

  it('resolves without throwing', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const t = new ConsoleTransport();
    await expect(
      t.send({ to: 'a@b.com', subject: 'Test', html: '<p>Test</p>', text: 'Test' })
    ).resolves.toBeUndefined();
    spy.mockRestore();
  });

  it('prints verbose HTML when verbose:true', async () => {
    const logs = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
    const t = new ConsoleTransport({ verbose: true });
    await t.send({ to: 'a@b.com', subject: 'S', html: '<b>BODY</b>' });
    spy.mockRestore();
    expect(logs.some((l) => l.includes('<b>BODY</b>'))).toBe(true);
  });
});

describe('EmailService', () => {
  it('defaults to ConsoleTransport', () => {
    const svc = new EmailService();
    expect(svc.transport).toBeInstanceOf(ConsoleTransport);
  });

  it('throws when given a non-transport', () => {
    expect(() => new EmailService({})).toThrow(TypeError);
  });

  it('setTransport() replaces the active transport', () => {
    const svc = new EmailService();
    const spy = new SpyTransport();
    svc.setTransport(spy);
    expect(svc.transport).toBe(spy);
  });

  it('setTransport() throws on invalid value', () => {
    const svc = new EmailService();
    expect(() => svc.setTransport('oops')).toThrow(TypeError);
  });

  it('sendRaw() delegates to the transport', async () => {
    const spy = new SpyTransport();
    const svc = new EmailService(spy);
    await svc.sendRaw({ to: 'x@y.com', subject: 'Hi', html: '<p>Hi</p>' });
    expect(spy.sent).toHaveLength(1);
    expect(spy.sent[0].to).toBe('x@y.com');
  });

  it('sendRaw() rejects when required fields are missing', async () => {
    const svc = new EmailService(new SpyTransport());
    await expect(svc.sendRaw({ to: 'x@y.com' })).rejects.toThrow();
  });

  it('sendMagicLink() sends an email with the magic URL', async () => {
    const spy = new SpyTransport();
    const svc = new EmailService(spy);
    await svc.sendMagicLink({
      to: 'user@example.com',
      magicUrl: 'https://app.test/verify?token=abc',
      appName: 'TestApp',
    });
    expect(spy.sent).toHaveLength(1);
    const { html, text, subject } = spy.sent[0];
    expect(html).toContain('https://app.test/verify?token=abc');
    expect(text).toContain('https://app.test/verify?token=abc');
    expect(subject).toContain('TestApp');
  });

  it('sendMagicLink() rejects when to or magicUrl is missing', async () => {
    const svc = new EmailService(new SpyTransport());
    await expect(svc.sendMagicLink({ to: 'a@b.com' })).rejects.toThrow();
    await expect(svc.sendMagicLink({ magicUrl: 'https://x.com' })).rejects.toThrow();
  });
});

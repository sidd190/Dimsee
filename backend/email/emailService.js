// backend/email/emailService.js
// Thin service layer that holds the active transport and exposes
// high-level helpers (sendMagicLink, sendRaw).

'use strict';

const { ConsoleTransport } = require('./transports/console');
const { buildMagicLinkEmail } = require('./templates/magicLink');
const { EmailTransport } = require('./transports/base');

class EmailService {
  /**
   * @param {EmailTransport} [transport] - Defaults to ConsoleTransport.
   */
  constructor(transport) {
    if (transport !== undefined && !(transport instanceof EmailTransport)) {
      throw new TypeError('transport must be an instance of EmailTransport');
    }
    this.transport = transport || new ConsoleTransport();
  }

  /**
   * Replace the active transport at runtime (useful for testing).
   * @param {EmailTransport} transport
   */
  setTransport(transport) {
    if (!(transport instanceof EmailTransport)) {
      throw new TypeError('transport must be an instance of EmailTransport');
    }
    this.transport = transport;
  }

  /**
   * Send a raw email through the active transport.
   * @param {{ to, subject, html, text }} options
   */
  async sendRaw({ to, subject, html, text }) {
    if (!to || !subject || !html) {
      throw new Error('sendRaw requires to, subject and html');
    }
    await this.transport.send({ to, subject, html, text });
  }

  /**
   * Send a magic-link sign-in email.
   * @param {object} options
   * @param {string} options.to           - Recipient address.
   * @param {string} options.magicUrl     - Full signed magic-link URL.
   * @param {number} [options.expiresMinutes=15]
   * @param {string} [options.appName]
   */
  async sendMagicLink({ to, magicUrl, expiresMinutes = 15, appName }) {
    if (!to || !magicUrl) {
      throw new Error('sendMagicLink requires to and magicUrl');
    }
    const { subject, html, text } = buildMagicLinkEmail({ magicUrl, expiresMinutes, appName });
    await this.transport.send({ to, subject, html, text });
  }
}

module.exports = { EmailService };

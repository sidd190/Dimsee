// backend/email/transports/base.js
// Abstract base class for all email transports.
// Every concrete transport must extend this class and implement send().

'use strict';

class EmailTransport {
  /**
   * Send an email.
   *
   * @param {object} options
   * @param {string}   options.to      - Recipient email address.
   * @param {string}   options.subject - Email subject line.
   * @param {string}   options.html    - HTML body.
   * @param {string}  [options.text]   - Plain-text fallback body.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async send({ to, subject, html, text }) {
    throw new Error(`${this.constructor.name} must implement send()`);
  }
}

module.exports = { EmailTransport };

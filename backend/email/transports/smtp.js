// backend/email/transports/smtp.js
// Production-ready SMTP transport backed by Nodemailer.
// Consumers must install nodemailer as a peer dependency.

'use strict';

const { EmailTransport } = require('./base');

class SmtpTransport extends EmailTransport {
  /**
   * @param {object} options         - Nodemailer transport options.
   * @param {string} options.host    - SMTP host.
   * @param {number} options.port    - SMTP port (e.g. 587 for STARTTLS, 465 for SSL).
   * @param {boolean} [options.secure=false] - true for port 465; false for STARTTLS.
   * @param {object} [options.auth]  - { user, pass } credentials.
   * @param {string} options.from    - Default "From" address (e.g. '"App" <no-reply@app.com>').
   */
  constructor({ host, port, secure = false, auth, from }) {
    super();
    if (!host || !port || !from) {
      throw new Error('SmtpTransport requires host, port and from');
    }
    this.from = from;

    // Lazy-require so that projects not using SMTP don't need nodemailer.
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
    } catch {
      throw new Error(
        'SmtpTransport requires nodemailer — run: npm install nodemailer'
      );
    }

    this.transporter = nodemailer.createTransport({ host, port, secure, auth });
  }

  async send({ to, subject, html, text }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text,
    });
  }
}

module.exports = { SmtpTransport };

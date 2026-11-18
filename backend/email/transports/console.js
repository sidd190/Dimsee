// backend/email/transports/console.js
// Development transport — prints the email to stdout instead of sending it.
// Zero external dependencies; safe to use in local dev and CI.

'use strict';

const { EmailTransport } = require('./base');

class ConsoleTransport extends EmailTransport {
  /**
   * @param {object} [options]
   * @param {boolean} [options.verbose=false] - Also print the full HTML body.
   */
  constructor({ verbose = false } = {}) {
    super();
    this.verbose = verbose;
  }

  async send({ to, subject, html, text }) {
    const divider = '─'.repeat(60);
    console.log(`\n${divider}`);
    console.log('[Dimsee · Console Transport] ✉  Email (not sent)');
    console.log(`  To      : ${to}`);
    console.log(`  Subject : ${subject}`);
    if (text) console.log(`  Text    : ${text}`);
    if (this.verbose && html) console.log(`  HTML    :\n${html}`);
    console.log(divider + '\n');
  }
}

module.exports = { ConsoleTransport };

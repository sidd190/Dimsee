// backend/email/templates/magicLink.js
// Generates HTML and plain-text bodies for a magic-link email.

'use strict';

/**
 * @param {object} options
 * @param {string} options.magicUrl  - The full signed magic-link URL.
 * @param {number} [options.expiresMinutes=15] - TTL to show in the email copy.
 * @param {string} [options.appName='Dimsee'] - App name shown in the email.
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildMagicLinkEmail({ magicUrl, expiresMinutes = 15, appName = 'Dimsee' }) {
  const subject = `Your sign-in link for ${appName}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f7;color:#333">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td>
          <h2 style="margin:0 0 8px;font-size:22px;color:#111">${appName}</h2>
          <p style="margin:0 0 24px;color:#555;font-size:15px">
            Click the button below to sign in. The link expires in <strong>${expiresMinutes} minutes</strong>
            and can only be used once.
          </p>
          <a href="${magicUrl}"
             style="display:inline-block;padding:14px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600">
            Sign in to ${appName}
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#888">
            If you didn't request this email you can safely ignore it.<br>
            Or copy this link into your browser:<br>
            <a href="${magicUrl}" style="color:#4f46e5;word-break:break-all">${magicUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Sign in to ${appName}\n\n` +
    `Use the link below to sign in. It expires in ${expiresMinutes} minutes and can only be used once.\n\n` +
    `${magicUrl}\n\n` +
    `If you didn't request this email you can safely ignore it.`;

  return { subject, html, text };
}

module.exports = { buildMagicLinkEmail };

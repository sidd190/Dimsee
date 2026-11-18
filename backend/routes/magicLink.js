// backend/routes/magicLink.js
// POST /api/auth/magic-link/send   — issue a magic link
// GET  /api/auth/magic-link/verify — consume it and set auth cookies

'use strict';

const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const MagicLinkToken = require('../models/MagicLinkToken');

const router = express.Router();

// ── Validation ──────────────────────────────────────────────────────────────

const sendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map((i) => ({
        field: i.path.join('.') || 'general',
        message: i.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the signed magic-link URL that will be emailed to the user.
 * @param {import('express').Request} req
 * @param {string} rawToken
 * @returns {string}
 */
function buildMagicUrl(req, rawToken) {
  const { corsOrigin, magicLinkVerifyPath = '/api/auth/magic-link/verify' } =
    req.app.locals.authConfig;
  const base = corsOrigin || `${req.protocol}://${req.get('host')}`;
  return `${base}${magicLinkVerifyPath}?token=${rawToken}`;
}

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/magic-link/send
 *
 * Body: { email }
 *
 * Always responds with 200 (even when email not found) to avoid
 * user-enumeration attacks.
 */
router.post('/send', validateBody(sendSchema), async (req, res) => {
  const { email } = req.body;

  try {
    const { emailService, magicLinkTtl = 900, appName } = req.app.locals.authConfig;

    const user = await User.findOne({ email });

    // Silently succeed even when the user doesn't exist.
    if (!user) {
      return res.json({
        success: true,
        message: 'If that address is registered you will receive a sign-in link shortly.',
      });
    }

    // Invalidate any existing unused tokens for this user so only the
    // most-recent link is valid at any given time.
    await MagicLinkToken.deleteMany({ userId: user._id, used: false });

    const { rawToken } = await MagicLinkToken.createToken(user._id, email, magicLinkTtl);
    const magicUrl = buildMagicUrl(req, rawToken);

    if (emailService) {
      await emailService.sendMagicLink({
        to: email,
        magicUrl,
        expiresMinutes: Math.round(magicLinkTtl / 60),
        appName,
      });
    } else {
      // Fallback: log to console when no emailService is configured.
      console.log('[Dimsee magic-link] Token URL:', magicUrl);
    }

    return res.json({
      success: true,
      message: 'If that address is registered you will receive a sign-in link shortly.',
    });
  } catch (err) {
    console.error('magic-link send error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/auth/magic-link/verify?token=<raw>
 *
 * Verifies the token, marks it used, sets auth cookies and redirects
 * the user to the frontend.
 */
router.get('/verify', async (req, res) => {
  const { token: rawToken } = req.query;

  if (!rawToken) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    const tokenHash = MagicLinkToken.hashToken(rawToken);
    const record = await MagicLinkToken.findOne({ tokenHash });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired magic link' });
    }

    if (record.used) {
      return res.status(400).json({ success: false, message: 'Magic link has already been used' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Magic link has expired' });
    }

    // Mark the token as used (one-time use enforcement).
    record.used = true;
    await record.save();

    const user = await User.findById(record.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Set JWT auth cookies using the shared helper from auth routes.
    const { setAuthCookies } = req.app.locals;
    if (typeof setAuthCookies === 'function') {
      await setAuthCookies(req, res, user);
    }

    const { corsOrigin, magicLinkSuccessPath = '/' } = req.app.locals.authConfig;
    const redirectUrl = `${corsOrigin || ''}${magicLinkSuccessPath}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('magic-link verify error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

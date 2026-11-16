// backend/middleware/auth.js - Auth Middleware
const jwt = require('jsonwebtoken');

// Express middleware that protects a route by verifying the `authToken` cookie
// or Authorization Bearer header against the app's configured JWT secret. Attach it directly:
//   app.get('/private', authMiddleware, handler)
function authMiddleware(req, res, next) {
  try {
    const jwtSecret = req.app?.locals?.authConfig?.jwtSecret;
    let token = req.cookies?.authToken;

    if (!token && req.headers?.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

module.exports = authMiddleware;

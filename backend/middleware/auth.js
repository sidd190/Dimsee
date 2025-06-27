// backend/middleware/auth.js - Auth Middleware
const jwt = require('jsonwebtoken');

function authMiddleware(extToken,extJwtSecret){(req, res, next) => {
  try {
    const { jwtSecret } = req.app.locals.authConfig || extJwtSecret;
    const token = req.cookies.authToken || extToken;

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
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
}

module.exports = authMiddleware;

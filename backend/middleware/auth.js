////middleware/auth.js
// ─────────────────────────────────────────────────────────────────────
// Token validation (no JWT).
// Token format produced by authController: "logged-in-<userId>-<timestamp>"
// auth        → validates token, attaches req.user = { id, role }
// roleAuth    → checks req.user.role against allowed roles array
// ─────────────────────────────────────────────────────────────────────

const db = require('../utils/dbManager');

const auth = async (req, res, next) => {
  const token = req.headers['authorization'] || req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
  }

  if (!token.startsWith('logged-in-')) {
    return res.status(401).json({ success: false, message: 'Invalid token format.' });
  }

  // Extract userId: "logged-in-<userId>-<timestamp>"
  const withoutPrefix = token.slice('logged-in-'.length);
  const lastDash = withoutPrefix.lastIndexOf('-');
  if (lastDash === -1) {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  const userId = withoutPrefix.substring(0, lastDash);

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Invalid token: missing userId.' });
  }

  try {
    const user = await db.getUser(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token invalid: user not found.' });
    }

    req.user = { id: userId, role: user.role };
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Auth error: ' + err.message });
  }
};

const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires role: ${roles.join(' or ')}.`
      });
    }
    next();
  };
};

module.exports = { auth, roleAuth };
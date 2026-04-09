// JWT disabled for now (can be re-enabled later)
// All routes are accessible without authentication until JWT is restored below.

// const jwt = require('jsonwebtoken');

// Verify JWT token and attach user info to request
// JWT DISABLED FOR NOW (can be re-enabled later)
const auth = (req, res, next) => {
  // JWT disabled - no authentication required
  // To re-enable JWT:
  // 1. Uncomment jwt.verify() code below
  // 2. Add Authorization header validation
  // 3. Uncomment similar code in roleAuth and optionalAuth
  
  next();
};

// Check if user has required role(s)
// JWT DISABLED FOR NOW (can be re-enabled later)
const roleAuth = (roles) => {
  return (req, res, next) => {
    // JWT disabled - role checks disabled
    // To re-enable: validate req.user.role against roles array
    next();
  };
};

// Optional: Attach user from token if provided, otherwise skip
// JWT DISABLED FOR NOW (can be re-enabled later)
const optionalAuth = (req, res, next) => {
  // JWT disabled - optional auth disabled
  // To re-enable: try to verify token if provided, skip if not
  next();
};

/* ========================================================================
// COMMENTED OUT JWT CODE - PRESERVED FOR RE-ENABLING LATER
// ========================================================================

// const jwt = require('jsonwebtoken');

// // Check if running in testing mode (allows bypassing auth)
// const TESTING_MODE = process.env.TESTING_MODE === 'true' || process.env.NODE_ENV === 'development';

// // Verify JWT token and attach user info to request
// const auth = (req, res, next) => {
//   try {
//     // In testing mode, create a test user if no token provided
//     if (TESTING_MODE && !req.headers.authorization) {
//       req.user = {
//         id: 'test-user-' + Date.now(),
//         role: 'Customer',
//         isTestUser: true
//       };
//       return next();
//     }

//     // Get token from Authorization header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ success: false, message: 'No token provided' });
//     }

//     const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
//     // Verify token
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || 'fooddelivery_secret_key_2024'
//     );

//     // Attach user info to request object
//     req.user = decoded;
//     next();
//   } catch (error) {
//     // Token expired or invalid
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ success: false, message: 'Token expired' });
//     }
//     res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };

// // Check if user has required role(s)
// const roleAuth = (roles) => {
//   return (req, res, next) => {
//     // In testing mode, allow all roles
//     if (TESTING_MODE) {
//       return next();
//     }

//     if (!req.user) {
//       return res.status(401).json({ success: false, message: 'Not authenticated' });
//     }

//     const userRole = req.user.role;
//     if (!roles.includes(userRole)) {
//       return res.status(403).json({
//         success: false,
//         message: `Access denied. Required role: ${roles.join(' or ')}, but got: ${userRole}`
//       });
//     }

//     next();
//   };
// };

// // Optional: Attach user from token if provided, otherwise skip
// const optionalAuth = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET || 'fooddelivery_secret_key_2024'
//       );
//       req.user = decoded;
//     } else if (TESTING_MODE) {
//       // In testing mode, create a test user
//       req.user = {
//         id: 'test-user-' + Date.now(),
//         role: 'Customer',
//         isTestUser: true
//       };
//     }
//   } catch (error) {
//     // If token is invalid, just continue without user (for public endpoints)
//   }
//   next();
// };

// ========================================================================
// End of commented JWT code

module.exports = { auth, roleAuth, optionalAuth };
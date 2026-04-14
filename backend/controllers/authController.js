////authController.js
const bcrypt = require('bcryptjs');
const db = require('../utils/dbManager');

// ================= REGISTER CUSTOMER =================
const registerCustomer = async (req, res) => {
  try {
    const { username, email, password, phoneNo, address } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check uniqueness by email + role (same email can exist as Owner)
    const existing = await db.getUserByEmailAndRole(email, 'Customer');
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A Customer account with this email already exists'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await db.createUser({
      username:  username.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      phoneNo:   phoneNo || '',
      address:   address || [],
      role:      'Customer'
    });

    const userObj = { ...user };
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: userObj
    });

  } catch (err) {
    console.error('[registerCustomer]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= REGISTER OWNER =================
// NOTE: Owner registers with credentials only.
// Restaurants are created from the owner dashboard after login.
const registerOwner = async (req, res) => {
  try {
    const { username, email, password, phoneNo, address } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check uniqueness by email + role (same email can exist as Customer)
    const existing = await db.getUserByEmailAndRole(email, 'Owner');
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An Owner account with this email already exists'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await db.createUser({
      username:  username.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      phoneNo:   phoneNo || '',
      address:   address || [],
      role:      'Owner'
    });

    const userObj = { ...user };
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'Owner registered successfully. You can now create your restaurant from the dashboard.',
      data: userObj
    });

  } catch (err) {
    console.error('[registerOwner]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= LOGIN =================
// Requires: email + password + role
// The role field differentiates between Customer and Owner accounts
// that share the same email address.
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required. Please select Customer or Owner.'
      });
    }

    const allowedRoles = ['Customer', 'Owner', 'DeliveryAgent', 'Admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed values: ${allowedRoles.join(', ')}`
      });
    }

    // Look up user by BOTH email and role
    const user = await db.getUserByEmailAndRole(email.trim(), role);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `No ${role} account found with this email`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Token format: logged-in-<userId>-<timestamp>  (no JWT as per project rules)
    const token = `logged-in-${user.id}-${Date.now()}`;

    const userObj = { ...user };
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data:    userObj,
      token:   token,
      role:    user.role
    });

  } catch (err) {
    console.error('[login]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerCustomer, registerOwner, login };
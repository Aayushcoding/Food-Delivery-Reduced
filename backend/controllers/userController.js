//userController.js
const bcrypt = require('bcryptjs');
const db = require('../utils/dbManager');

// ================= GET ALL USERS =================
const getUsers = async(req, res) => {
  try {
    const users = (await db.getAllUsers()).map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });
    res.json({ success: true, count: users.length, data: users });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE USER =================
const getUser = async(req, res) => {
  try {
    const user = await db.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userObj = { ...user };
    delete userObj.password;
    res.json({ success: true, data: userObj });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CREATE USER =================
const createUser = async(req, res) => {
  try {
    const { username, email, phoneNo, password, role, address } = req.body;

    if (!username || !email || !phoneNo || !password) {
      return res.status(400).json({ success: false, message: 'username, email, phoneNo and password are required' });
    }

    // Enforce same-email multi-role: only block if same email+role combo exists
    const existing = await db.getUserByEmailAndRole(email.toLowerCase(), role || 'Customer');
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email and role already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.createUser({
      username,
      email: email.toLowerCase(),
      phoneNo,
      password: hashedPassword,
      address: address || [],
      role: role || 'Customer'
    });

    const userObj = { ...user };
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE USER =================
const updateUser = async(req, res) => {
  try {
    const { id } = req.params;

    // Ownership check — users can only update their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile.' });
    }

    let updates = { ...req.body };
    delete updates.id;        // prevent ID mutation
    delete updates.role;      // prevent role escalation
    delete updates.email;     // email cannot be changed here
    delete updates.password;  // use dedicated endpoint

    if (updates.username !== undefined) {
      if (!updates.username || !updates.username.trim()) {
        return res.status(400).json({ success: false, message: 'Username cannot be empty.' });
      }
      updates.username = updates.username.trim();
    }

    if (updates.phoneNo !== undefined) updates.phoneNo = String(updates.phoneNo).trim();

    const updated = await db.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userObj = { ...updated };
    delete userObj.password;

    res.json({ success: true, data: userObj });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE USER =================
const deleteUser = async(req, res) => {
  try {
    const { id } = req.params;
    // Users can only delete their own account
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own account.' });
    }
    const user = await db.deleteUser(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
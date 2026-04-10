// controllers/userController.js
// ✅ Using MongoDB with Mongoose
// ✅ Passwords hashed with bcrypt

const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ── GET ALL USERS ──────────────────────────────────────────────────────────────
// GET /api/users?role=Customer&search=amit
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Filter by search if provided
    if (search) {
      const searchLower = String(search).toLowerCase();
      query.$or = [
        { username: new RegExp(searchLower, 'i') },
        { email: new RegExp(searchLower, 'i') }
      ];
    }

    const users = await User.find(query).select('-password');
    console.log(`✅ GET /api/users - Found ${users.length} users`);
    
    res.json({ success: true, total: users.length, data: users });
  } catch (error) {
    console.error('❌ Error in getUsers:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE USER ────────────────────────────────────────────────────────────
// GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id }).select('-password');
    
    if (!user) {
      console.warn(`⚠️  User not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ GET /api/users/${req.params.id} - Found user`);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Error in getUser:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── REGISTER / CREATE USER ─────────────────────────────────────────────────────
// POST /api/users
const createUser = async (req, res) => {
  try {
    const { id, username, email, phoneNo, password, role, address } = req.body;

    // Validate required fields
    if (!id || !username || !email || !phoneNo || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields: id, username, email, phoneNo, password, role' 
      });
    }

    // Validate role
    const allowedRoles = ['Customer', 'Owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Use Customer or Owner.' 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Check if id already exists
    const existingId = await User.findOne({ id });
    if (existingId) {
      return res.status(400).json({ success: false, message: 'User ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      id: String(id),
      username: String(username).trim(),
      email: String(email).trim().toLowerCase(),
      phoneNo: String(phoneNo),
      password: hashedPassword,
      role,
      address: address || []
    });

    console.log(`✅ POST /api/users - User created: ${newUser.id}`);

    // Return user without password
    const userWithoutPass = await User.findOne({ id: newUser.id }).select('-password');
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPass
    });
  } catch (error) {
    console.error('❌ Error in createUser:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── LOGIN USER ─────────────────────────────────────────────────────────────────
// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Optional role check
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Your role is: ${user.role}` });
    }

    // Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    console.log(`✅ POST /api/users/login - Login successful for user: ${user.id}`);

    // Return user without password
    const userWithoutPass = await User.findOne({ email }).select('-password');
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPass
    });
  } catch (error) {
    console.error('❌ Error in loginUser:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE USER ────────────────────────────────────────────────────────────────
// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = { ...req.body };

    // Never allow id, password, or createdAt override
    delete updates.id;
    delete updates.password;
    delete updates.createdAt;

    const user = await User.findOneAndUpdate(
      { id: userId },
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ PUT /api/users/${userId} - User updated`);
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    console.error('❌ Error in updateUser:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ── DELETE USER ────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findOneAndDelete({ id: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ DELETE /api/users/${userId} - User deleted`);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, loginUser, updateUser, deleteUser };

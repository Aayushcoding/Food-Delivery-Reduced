const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  loginUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// ✅ Routes using db.json (no JWT)
// POST /api/users — register new user
router.post('/', createUser);

// POST /api/users/login — login user
router.post('/login', loginUser);

// GET /api/users — get all users
router.get('/', getUsers);

// GET /api/users/:id — get single user
router.get('/:id', getUser);

// PUT /api/users/:id — update user
router.put('/:id', updateUser);

// DELETE /api/users/:id — delete user
router.delete('/:id', deleteUser);

module.exports = router;
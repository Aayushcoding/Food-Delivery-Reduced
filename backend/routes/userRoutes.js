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

// POST /api/users — register (JWT disabled for now (can be re-enabled later))
router.post('/', createUser);
router.post('/login', loginUser);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
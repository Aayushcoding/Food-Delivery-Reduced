const express = require('express');
const router = express.Router();
// Auth middleware DISABLED FOR NOW
// const { auth, roleAuth } = require('../middleware/auth');
const {
  getMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu
} = require('../controllers/menuController');

router.get('/', getMenus); // Public - customers can view
router.get('/:id', getMenu); // Public - customers can view
// Auth middleware DISABLED FOR NOW - all APIs are public
router.post('/', createMenu); // All users can create
// Auth middleware DISABLED FOR NOW - all APIs are public
router.put('/:id', updateMenu); // All users can update
// Auth middleware DISABLED FOR NOW - all APIs are public
router.delete('/:id', deleteMenu); // All users can delete

module.exports = router;
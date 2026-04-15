// restaurantRoutes.js
const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getRestaurantByOwner,
  createRestaurant,
  updateRestaurant
} = require("../controllers/restaurantController");

// ── PUBLIC ───────────────────────────────────────────────────────────
router.get("/", getAllRestaurants);
router.get("/owner/:ownerId", getRestaurantByOwner);
router.get("/:id/menu", getRestaurantMenu);
router.get("/:id", getRestaurantById);

// ── OWNER-ONLY ───────────────────────────────────────────────────────
router.post("/", auth, roleAuth(['Owner']), upload.single('displayImage'), createRestaurant);
router.put("/:id", auth, roleAuth(['Owner']), upload.single('displayImage'), updateRestaurant);

module.exports = router;
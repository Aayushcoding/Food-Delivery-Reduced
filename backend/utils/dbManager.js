// utils/dbManager.js
// ─────────────────────────────────────────────────────────────────────────────
// MongoDB data access layer — all operations use Mongoose models.
// All functions are async (Promise-based). Controllers must await these calls.
// ─────────────────────────────────────────────────────────────────────────────


const User         = require('../models/User');
const Restaurant   = require('../models/Restaurant');
const Menu         = require('../models/Menu');
const Cart         = require('../models/Cart');
const Order        = require('../models/Order');
const DeliveryAgent= require('../models/DeliveryAgent');

// ─── Strip MongoDB internals from plain objects returned by .lean() ───────────
const strip = (doc) => {
  if (!doc) return doc;
  const obj = { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj;
};
const stripMany = (docs) => docs.map(strip);

// ─── ID generators ───────────────────────────────────────────────────────────
const genUserId           = () => `usr_${Date.now().toString(36)}`;
const genRestaurantId     = () => `rest_${Date.now().toString(36)}`;
const genMenuId           = () => `menu_${Date.now().toString(36)}`;
const genCartId           = () => `cart_${Date.now().toString(36)}`;
const genOrderId          = () => `ord_${Date.now().toString(36)}`;
const genDeliveryAgentId  = () => `da_${Date.now().toString(36)}`;

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

const getUser = (id) =>
  User.findOne({ id }).lean().then(strip);

const getUserByEmail = (email) =>
  User.findOne({ email: email.toLowerCase() }).lean().then(strip);

// Find a user by BOTH email and role — needed when same email has multiple roles
const getUserByEmailAndRole = (email, role) =>
  User.findOne({ email: email.toLowerCase(), role }).lean().then(strip);


const getAllUsers = () =>
  User.find({}).lean().then(stripMany);

const createUser = async (userData) => {
  const user = new User({
    id:        userData.id || genUserId(),
    username:  userData.username,
    email:     userData.email.toLowerCase(),
    password:  userData.password,
    phoneNo:   userData.phoneNo || '',
    address:   userData.address || [],
    role:      userData.role || 'Customer',
    createdAt: userData.createdAt || new Date().toISOString()
  });
  const saved = await user.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateUser = (id, updates) =>
  User.findOneAndUpdate({ id }, updates, { new: true }).lean().then(strip);

const deleteUser = (id) =>
  User.findOneAndDelete({ id }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANTS
// ─────────────────────────────────────────────────────────────────────────────

const getRestaurant = (restaurantId) =>
  Restaurant.findOne({ restaurantId }).lean().then(strip);

const getRestaurantByOwnerId = (ownerId) =>
  Restaurant.find({ ownerId }).lean().then(stripMany);

const getAllRestaurants = () =>
  Restaurant.find({}).lean().then(stripMany);

const createRestaurant = async (data) => {
  const restaurant = new Restaurant({
    restaurantId:        data.restaurantId || genRestaurantId(),
    restaurantName:      data.restaurantName,
    ownerId:             data.ownerId,
    restaurantContactNo: data.restaurantContactNo || '',
    address:             data.address || '',
    email:               data.email || '',
    cuisine:             data.cuisine || [],
    isVeg:               data.isVeg || false,
    rating:              data.rating || 0,
    gstinNo:             data.gstinNo || '',
    displayImage:        data.displayImage || data.imageUrl || '',
    imageUrl:            data.imageUrl || data.displayImage || ''
  });
  const saved = await restaurant.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateRestaurant = (restaurantId, updates) =>
  Restaurant.findOneAndUpdate({ restaurantId }, updates, { new: true }).lean().then(strip);

const deleteRestaurant = (restaurantId) =>
  Restaurant.findOneAndDelete({ restaurantId }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────────────────────────────────────

const getMenuItem = (menuId) =>
  Menu.findOne({ menuId }).lean().then(strip);

const getMenuByRestaurant = (restaurantId) =>
  Menu.find({ restaurantId }).lean().then(stripMany);

const getAllMenus = () =>
  Menu.find({}).lean().then(stripMany);

const createMenuItem = async (data) => {
  const item = new Menu({
    menuId:       data.menuId || genMenuId(),
    restaurantId: data.restaurantId,
    itemName:     data.itemName,
    price:        data.price,
    category:     data.category || '',
    rating:       data.rating || 0,
    isAvailable:  data.isAvailable !== undefined ? data.isAvailable : true,
    description:  data.description || '',
    isVeg:        data.isVeg || false,
    image:        data.image || data.imageUrl || '',
    imageUrl:     data.imageUrl || data.image || ''
  });
  const saved = await item.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateMenuItem = (menuId, updates) =>
  Menu.findOneAndUpdate({ menuId }, updates, { new: true }).lean().then(strip);

const deleteMenuItem = (menuId) =>
  Menu.findOneAndDelete({ menuId }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────────────────

const getCart = (id) =>
  Cart.findOne({ id }).lean().then(strip);

const getCartByUserId = (userId) =>
  Cart.findOne({ userId }).sort({ createdAt: -1 }).lean().then(strip);

const getAllCarts = () =>
  Cart.find({}).lean().then(stripMany);

const createCart = async (data) => {
  const cart = new Cart({
    id:           data.id || genCartId(),
    userId:       data.userId,
    restaurantId: data.restaurantId || '',
    items:        data.items || [],
    totalAmount:  data.totalAmount || 0,
    createdAt:    data.createdAt || new Date().toISOString(),
    updatedAt:    new Date().toISOString()
  });
  const saved = await cart.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateCart = (id, updates) => {
  updates.updatedAt = new Date().toISOString();
  return Cart.findOneAndUpdate({ id }, updates, { new: true }).lean().then(strip);
};

const deleteCart = (id) =>
  Cart.findOneAndDelete({ id }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

const getOrder = (id) =>
  Order.findOne({ id }).lean().then(strip);

const getOrdersByUserId = (userId) =>
  Order.find({ userId }).sort({ createdAt: -1 }).lean().then(stripMany);

const getOrdersByRestaurantId = (restaurantId) =>
  Order.find({ restaurantId }).sort({ createdAt: -1 }).lean().then(stripMany);

const getAllOrders = () =>
  Order.find({}).lean().then(stripMany);

const createOrder = async (data) => {
  const order = new Order({
    id:              data.id || genOrderId(),
    userId:          data.userId,
    restaurantId:    data.restaurantId || '',
    items:           data.items || [],
    totalAmount:     data.totalAmount || 0,
    deliveryAddress: data.deliveryAddress || '',
    status:          data.status || 'pending',
    createdAt:       data.createdAt || new Date().toISOString()
  });
  const saved = await order.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateOrder = (id, updates) =>
  Order.findOneAndUpdate({ id }, updates, { new: true }).lean().then(strip);

const deleteOrder = (id) =>
  Order.findOneAndDelete({ id }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY AGENTS
// ─────────────────────────────────────────────────────────────────────────────

const getAllDeliveryAgents = () =>
  DeliveryAgent.find({}).lean().then(stripMany);

const getDeliveryAgent = (id) =>
  DeliveryAgent.findOne({ id }).lean().then(strip);

const createDeliveryAgent = async (data) => {
  const agent = new DeliveryAgent({
    id:          data.id || genDeliveryAgentId(),
    name:        data.name || '',
    email:       data.email || '',
    phoneNo:     data.phoneNo || '',
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
  });
  const saved = await agent.save();
  return saved.toObject({ transform: false, versionKey: false });
};

const updateDeliveryAgent = (id, updates) =>
  DeliveryAgent.findOneAndUpdate({ id }, updates, { new: true }).lean().then(strip);

const deleteDeliveryAgent = (id) =>
  DeliveryAgent.findOneAndDelete({ id }).lean().then(strip);

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Users
  getUser, getUserByEmail, getUserByEmailAndRole, getAllUsers, createUser, updateUser, deleteUser,
  // Restaurants
  getRestaurant, getRestaurantByOwnerId, getAllRestaurants, createRestaurant, updateRestaurant, deleteRestaurant,
  // Menu
  getMenuItem, getMenuByRestaurant, getAllMenus, createMenuItem, updateMenuItem, deleteMenuItem,
  // Cart
  getCart, getCartByUserId, getAllCarts, createCart, updateCart, deleteCart,
  // Orders
  getOrder, getOrdersByUserId, getOrdersByRestaurantId, getAllOrders, createOrder, updateOrder, deleteOrder,
  // Delivery Agents
  getAllDeliveryAgents, getDeliveryAgent, createDeliveryAgent, updateDeliveryAgent, deleteDeliveryAgent
};

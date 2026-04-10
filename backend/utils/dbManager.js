// ==========================================
// DB Manager - Manages db.json read/write
// ==========================================

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../config/db.json');

/**
 * Read entire database from db.json
 */
function readDB() {
  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return null;
  }
}

/**
 * Write entire database to db.json
 */
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
  const db = readDB();
  if (!db || !db.users) return null;

  const emailLower = String(email).trim().toLowerCase();
  return db.users.find(u => String(u.email).toLowerCase() === emailLower);
}

/**
 * Find user by id
 */
function findUserById(id) {
  const db = readDB();
  if (!db || !db.users) return null;

  return db.users.find(u => u.id === id);
}

/**
 * Find user by username
 */
function findUserByUsername(username) {
  const db = readDB();
  if (!db || !db.users) return null;

  const usernameLower = String(username).trim().toLowerCase();
  return db.users.find(u => String(u.username).toLowerCase() === usernameLower);
}

/**
 * Add new user to db.json
 */
function addUser(user) {
  const db = readDB();
  if (!db || !db.users) return null;

  // Create user object
  const newUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNo: user.phoneNo || '',
    password: user.password,
    address: user.address || [],
    role: user.role || 'Customer',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  if (writeDB(db)) {
    return newUser;
  }
  return null;
}

/**
 * Update user in db.json
 */
function updateUser(userId, updates) {
  const db = readDB();
  if (!db || !db.users) return null;

  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  // Update user fields
  db.users[userIndex] = {
    ...db.users[userIndex],
    ...updates,
    id: db.users[userIndex].id, // Don't allow ID changes
    createdAt: db.users[userIndex].createdAt // Don't allow createdAt changes
  };

  if (writeDB(db)) {
    return db.users[userIndex];
  }
  return null;
}

/**
 * Get all users (optional filter by role)
 */
function getAllUsers(role = null) {
  const db = readDB();
  if (!db || !db.users) return [];

  if (role) {
    return db.users.filter(u => u.role === role);
  }
  return db.users;
}

/**
 * Get user without password
 */
function getUserWithoutPassword(user) {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ==========================================
// RESTAURANT FUNCTIONS
// ==========================================

function getAllRestaurants() {
  const db = readDB();
  if (!db || !db.restaurants) return [];
  return db.restaurants;
}

function getRestaurantById(id) {
  const db = readDB();
  if (!db || !db.restaurants) return null;
  return db.restaurants.find(r => String(r.restaurantId) === String(id) || String(r.id) === String(id));
}

function getRestaurantsByOwner(ownerId) {
  const db = readDB();
  if (!db || !db.restaurants) return [];
  return db.restaurants.filter(r => String(r.ownerId) === String(ownerId));
}

function addRestaurant(restaurant) {
  const db = readDB();
  if (!db || !db.restaurants) return null;
  
  const newRestaurant = {
    restaurantId: restaurant.restaurantId || restaurant.id,
    restaurantName: restaurant.restaurantName || restaurant.name,
    ownerId: restaurant.ownerId,
    contactNo: restaurant.contactNo || '',
    address: restaurant.address || '',
    email: restaurant.email || '',
    cuisine: restaurant.cuisine || [],
    isVeg: restaurant.isVeg || false,
    rating: restaurant.rating || 4.5,
    gstinNo: restaurant.gstinNo || '',
    imageUrl: restaurant.imageUrl || ''
  };
  
  db.restaurants.push(newRestaurant);
  
  if (writeDB(db)) {
    return newRestaurant;
  }
  return null;
}

function updateRestaurant(restaurantId, updates) {
  const db = readDB();
  if (!db || !db.restaurants) return null;

  const index = db.restaurants.findIndex(r => String(r.restaurantId) === String(restaurantId) || String(r.id) === String(restaurantId));
  if (index === -1) return null;

  const updated = {
    ...db.restaurants[index],
    ...updates,
    restaurantId: db.restaurants[index].restaurantId,
    createdAt: db.restaurants[index].createdAt
  };
  
  db.restaurants[index] = updated;

  if (writeDB(db)) {
    return db.restaurants[index];
  }
  return null;
}

// ==========================================
// MENU FUNCTIONS
// ==========================================

function getAllMenus() {
  const db = readDB();
  if (!db || !db.menus) return [];
  return db.menus;
}

function getMenuById(id) {
  const db = readDB();
  if (!db || !db.menus) return null;
  return db.menus.find(m => String(m.menuId) === String(id) || String(m.id) === String(id));
}

function getMenusByRestaurant(restaurantId) {
  const db = readDB();
  if (!db || !db.menus) return [];
  return db.menus.filter(m => String(m.restaurantId) === String(restaurantId));
}

function addMenu(menu) {
  const db = readDB();
  if (!db || !db.menus) return null;

  const newMenu = {
    menuId: menu.menuId || menu.id,
    restaurantId: menu.restaurantId,
    itemName: menu.itemName || menu.name,
    price: menu.price,
    category: menu.category || 'Others',
    description: menu.description || '',
    isVeg: menu.isVeg || false,
    isAvailable: menu.isAvailable !== false,
    imageUrl: menu.imageUrl || '',
    rating: menu.rating || 4.5
  };

  db.menus.push(newMenu);

  if (writeDB(db)) {
    return newMenu;
  }
  return null;
}

function updateMenu(menuId, updates) {
  const db = readDB();
  if (!db || !db.menus) return null;

  const index = db.menus.findIndex(m => String(m.menuId) === String(menuId) || String(m.id) === String(menuId));
  if (index === -1) return null;

  db.menus[index] = {
    ...db.menus[index],
    ...updates,
    menuId: db.menus[index].menuId
  };

  if (writeDB(db)) {
    return db.menus[index];
  }
  return null;
}

// ==========================================
// CART FUNCTIONS
// ==========================================

function getAllCarts() {
  const db = readDB();
  if (!db || !db.carts) return [];
  return db.carts;
}

function getCartByUserId(userId) {
  const db = readDB();
  if (!db || !db.carts) return null;
  return db.carts.find(c => String(c.userId) === String(userId));
}

function addCart(cart) {
  const db = readDB();
  if (!db || !db.carts) return null;

  const newCart = {
    id: cart.id || `cart_${Date.now()}`,
    userId: cart.userId,
    restaurantId: cart.restaurantId,
    items: cart.items || [],
    totalAmount: cart.totalAmount || 0
  };

  db.carts.push(newCart);

  if (writeDB(db)) {
    return newCart;
  }
  return null;
}

function updateCart(cartId, updates) {
  const db = readDB();
  if (!db || !db.carts) return null;

  const index = db.carts.findIndex(c => String(c.id) === String(cartId));
  if (index === -1) return null;

  db.carts[index] = {
    ...db.carts[index],
    ...updates,
    id: db.carts[index].id
  };

  if (writeDB(db)) {
    return db.carts[index];
  }
  return null;
}

function deleteCart(cartId) {
  const db = readDB();
  if (!db || !db.carts) return false;

  const index = db.carts.findIndex(c => String(c.id) === String(cartId));
  if (index === -1) return false;

  db.carts.splice(index, 1);
  return writeDB(db);
}

// ==========================================
// ORDER FUNCTIONS
// ==========================================

function getAllOrders() {
  const db = readDB();
  if (!db || !db.orders) return [];
  return db.orders;
}

function getOrderById(id) {
  const db = readDB();
  if (!db || !db.orders) return null;
  return db.orders.find(o => String(o.orderId) === String(id) || String(o.id) === String(id));
}

function getOrdersByUserId(userId) {
  const db = readDB();
  if (!db || !db.orders) return [];
  return db.orders.filter(o => String(o.userId) === String(userId));
}

function getOrdersByRestaurantId(restaurantId) {
  const db = readDB();
  if (!db || !db.orders) return [];
  return db.orders.filter(o => String(o.restaurantId) === String(restaurantId));
}

function getOrdersByDeliveryAgent(agentId) {
  const db = readDB();
  if (!db || !db.orders) return [];
  return db.orders.filter(o => String(o.deliveryAgentId) === String(agentId));
}

function addOrder(order) {
  const db = readDB();
  if (!db || !db.orders) return null;

  const newOrder = {
    orderId: order.orderId || order.id || `order_${Date.now()}`,
    userId: order.userId,
    restaurantId: order.restaurantId,
    items: order.items || [],
    totalAmount: order.totalAmount || 0,
    deliveryAgentId: order.deliveryAgentId || null,
    status: order.status || 'Pending',
    date: order.date || new Date().toISOString()
  };

  db.orders.push(newOrder);

  if (writeDB(db)) {
    return newOrder;
  }
  return null;
}

function updateOrder(orderId, updates) {
  const db = readDB();
  if (!db || !db.orders) return null;

  const index = db.orders.findIndex(o => String(o.orderId) === String(orderId) || String(o.id) === String(orderId));
  if (index === -1) return null;

  db.orders[index] = {
    ...db.orders[index],
    ...updates,
    orderId: db.orders[index].orderId
  };

  if (writeDB(db)) {
    return db.orders[index];
  }
  return null;
}

// ==========================================
// DELIVERY AGENT FUNCTIONS
// ==========================================

function getAllDeliveryAgents() {
  const db = readDB();
  if (!db || !db.deliveryAgents) return [];
  return db.deliveryAgents;
}

function getDeliveryAgentById(id) {
  const db = readDB();
  if (!db || !db.deliveryAgents) return null;
  return db.deliveryAgents.find(d => String(d.id) === String(id));
}

function getAvailableDeliveryAgents() {
  const db = readDB();
  if (!db || !db.deliveryAgents) return [];
  return db.deliveryAgents.filter(d => d.isAvailable === true);
}

function addDeliveryAgent(agent) {
  const db = readDB();
  if (!db || !db.deliveryAgents) return null;

  const newAgent = {
    id: agent.id,
    agentName: agent.agentName || agent.name,
    contactNo: agent.contactNo || agent.phoneNo || '',
    isAvailable: agent.isAvailable !== false,
    vehicleNo: agent.vehicleNo || ''
  };

  db.deliveryAgents.push(newAgent);

  if (writeDB(db)) {
    return newAgent;
  }
  return null;
}

function updateDeliveryAgent(agentId, updates) {
  const db = readDB();
  if (!db || !db.deliveryAgents) return null;

  const index = db.deliveryAgents.findIndex(d => String(d.id) === String(agentId));
  if (index === -1) return null;

  db.deliveryAgents[index] = {
    ...db.deliveryAgents[index],
    ...updates,
    id: db.deliveryAgents[index].id
  };

  if (writeDB(db)) {
    return db.deliveryAgents[index];
  }
  return null;
}

module.exports = {
  readDB,
  writeDB,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  addUser,
  updateUser,
  getAllUsers,
  getUserWithoutPassword,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantsByOwner,
  addRestaurant,
  updateRestaurant,
  getAllMenus,
  getMenuById,
  getMenusByRestaurant,
  addMenu,
  updateMenu,
  getAllCarts,
  getCartByUserId,
  addCart,
  updateCart,
  deleteCart,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByRestaurantId,
  getOrdersByDeliveryAgent,
  addOrder,
  updateOrder,
  getAllDeliveryAgents,
  getDeliveryAgentById,
  getAvailableDeliveryAgents,
  addDeliveryAgent,
  updateDeliveryAgent
};

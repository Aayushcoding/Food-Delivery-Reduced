// controllers/deliveryController.js
// Using db.json for data persistence (NO MongoDB)

const { getAllDeliveryAgents, getDeliveryAgentById, addDeliveryAgent, updateDeliveryAgent: dbUpdateDeliveryAgent } = require('../utils/dbManager');

// ── GET ALL DELIVERY AGENTS ────────────────────────────────────────────────────
// GET /api/delivery?isAvailable=true&search=nisha&page=1&limit=10
const getDeliveryAgents = async (req, res) => {
  try {
    const { isAvailable, search, page = 1, limit = 10 } = req.query;

    let agents = getAllDeliveryAgents();

    // Apply filters
    if (isAvailable !== undefined) {
      agents = agents.filter(a => String(a.isAvailable) === String(isAvailable === 'true'));
    }

    if (search) {
      const searchLower = String(search).toLowerCase();
      agents = agents.filter(a =>
        String(a.agentName).toLowerCase().includes(searchLower) ||
        String(a.vehicleNo || '').toLowerCase().includes(searchLower) ||
        String(a.contactNo || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const total = agents.length;

    const paginatedAgents = agents.slice(skip, skip + limitNum);

    res.json({ success: true, total, page: pageNum, limit: limitNum, data: paginatedAgents });
  } catch (error) {
    console.error('Error in getDeliveryAgents:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE DELIVERY AGENT ──────────────────────────────────────────────────
// GET /api/delivery/:id
const getDeliveryAgent = async (req, res) => {
  try {
    const agent = getDeliveryAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error in getDeliveryAgent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE DELIVERY AGENT ──────────────────────────────────────────────────────
// POST /api/delivery
const createDeliveryAgent = async (req, res) => {
  try {
    const { id, agentName, contactNo, vehicleNo } = req.body;

    if (!id || !agentName) {
      return res.status(400).json({ success: false, message: 'id and agentName are required' });
    }

    // Check if agent already exists
    if (getDeliveryAgentById(id)) {
      return res.status(409).json({ success: false, message: `Agent with id '${id}' already exists` });
    }

    const newAgent = addDeliveryAgent({
      id,
      agentName,
      contactNo: contactNo || '',
      vehicleNo: vehicleNo || '',
      isAvailable: req.body.isAvailable !== false
    });

    if (!newAgent) {
      return res.status(500).json({ success: false, message: 'Failed to create delivery agent' });
    }

    res.status(201).json({ success: true, data: newAgent });
  } catch (error) {
    console.error('Error in createDeliveryAgent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE DELIVERY AGENT ──────────────────────────────────────────────────────
// PUT /api/delivery/:id
const updateDeliveryAgent = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id; // prevent id change

    const updated = dbUpdateDeliveryAgent(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateDeliveryAgent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE DELIVERY AGENT ──────────────────────────────────────────────────────
// DELETE /api/delivery/:id
const deleteDeliveryAgent = async (req, res) => {
  try {
    const agent = getDeliveryAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }

    const db = require('../utils/dbManager').readDB();
    db.deliveryAgents = db.deliveryAgents.filter(a => String(a.id) !== String(req.params.id));
    require('../utils/dbManager').writeDB(db);

    res.json({ success: true, message: 'Delivery agent deleted' });
  } catch (error) {
    console.error('Error in deleteDeliveryAgent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDeliveryAgents, getDeliveryAgent, createDeliveryAgent, updateDeliveryAgent, deleteDeliveryAgent };

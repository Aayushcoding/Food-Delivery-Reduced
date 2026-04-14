//deliveryController.js
const db = require('../utils/dbManager');

// GET /api/delivery
const getDeliveryAgents = async (req, res) => {
  try {
    const { search } = req.query;
    let agents = await db.getAllDeliveryAgents();

    if (search) {
      const q = search.toLowerCase();
      agents = agents.filter(a =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.phoneNo && a.phoneNo.includes(search))
      );
    }

    res.json({ success: true, data: agents });
  } catch (error) {
    console.error('[getDeliveryAgents]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/delivery/:id
const getDeliveryAgent = async (req, res) => {
  try {
    const agent = await db.getDeliveryAgent(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('[getDeliveryAgent]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/delivery
const createDeliveryAgent = async (req, res) => {
  try {
    const { name, phoneNo, email } = req.body;

    if (!name || !phoneNo) {
      return res.status(400).json({ success: false, message: 'name and phoneNo are required' });
    }

    const agent = await db.createDeliveryAgent({ name, phoneNo, email });
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error('[createDeliveryAgent]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/delivery/:id
const updateDeliveryAgent = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;

    const updated = await db.updateDeliveryAgent(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[updateDeliveryAgent]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/delivery/:id
const deleteDeliveryAgent = async (req, res) => {
  try {
    const deleted = await db.deleteDeliveryAgent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Delivery agent not found' });
    }
    res.json({ success: true, message: 'Delivery agent deleted' });
  } catch (error) {
    console.error('[deleteDeliveryAgent]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDeliveryAgents, getDeliveryAgent, createDeliveryAgent, updateDeliveryAgent, deleteDeliveryAgent };
// models/DeliveryAgent.js
const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
  id:             { type: String, required: true, unique: true, index: true },
  name:           { type: String, default: '' },
  email:          { type: String, default: '' },
  phoneNo:        { type: String, default: '' },
  isAvailable:    { type: Boolean, default: true },
  currentOrderId: { type: String, default: null }
}, {
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);

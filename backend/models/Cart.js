// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  itemId:       { type: String, required: true },
  name:         { type: String, default: '' },
  price:        { type: Number, default: 0 },
  quantity:     { type: Number, default: 1, min: 1 },
  restaurantId: { type: String, default: '' }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true, index: true },
  userId:       { type: String, required: true, index: true },
  restaurantId: { type: String, default: '' },
  items:        { type: [cartItemSchema], default: [] },
  totalAmount:  { type: Number, default: 0 },
  createdAt:    { type: String, default: () => new Date().toISOString() },
  updatedAt:    { type: String, default: () => new Date().toISOString() }
}, {
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

module.exports = mongoose.model('Cart', cartSchema);

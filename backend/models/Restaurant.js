// models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurantId:         { type: String, required: true, unique: true, index: true },
  restaurantName:       { type: String, required: true, trim: true },
  ownerId:              { type: String, required: true, index: true },
  restaurantContactNo:  { type: String, default: '' },
  address:              { type: String, default: '' },
  email:                { type: String, default: '' },
  cuisine:              { type: [String], default: [] },
  isVeg:                { type: Boolean, default: false },
  rating:               { type: Number, default: 0 },
  gstinNo:              { type: String, default: '' },
  displayImage:         { type: String, default: '' },
  imageUrl:             { type: String, default: '' }
}, {
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

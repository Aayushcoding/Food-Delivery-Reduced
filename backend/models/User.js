// models/User.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, default: '' },
  city:   { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true, index: true },
  username:  { type: String, required: true, trim: true },
  // email is NO LONGER globally unique — the compound index [email + role] is unique
  email:     { type: String, required: true, lowercase: true, trim: true },
  phoneNo:   { type: String, default: '' },
  password:  { type: String, required: true },
  address:   { type: [addressSchema], default: [] },
  role:      { type: String, enum: ['Customer', 'Owner', 'DeliveryAgent', 'Admin'], default: 'Customer' },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, {
  versionKey: false,
  toJSON: {
    transform(doc, ret) {
      delete ret._id;
      return ret;
    }
  }
});

// Compound unique index: same email CAN exist for different roles
// This replaces the old single-field unique: true on email
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);

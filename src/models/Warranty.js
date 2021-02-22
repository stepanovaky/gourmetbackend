const mongoose = require('mongoose');

const WarrantySchema = mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  warrantyExp: {
    type: String,
    default: ""
  },
  warrantyStart: {
    type: String,
    required: true
  },
  ownerEmail: {
    type: String,
    // required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  amazonOrderId: {
    type: String,
    default: ""
  },
  approval: {
    type: String,
    default: "pending"
  },
  createtAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('warranties', WarrantySchema);
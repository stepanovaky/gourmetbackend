const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  warrantyDuration: {
    type: Number,
    // required: true
  },
  createtAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('products', ProductSchema);
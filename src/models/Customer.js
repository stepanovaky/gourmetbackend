const mongoose = require('mongoose');

const CustomerSchema = mongoose.Schema({
  ownerEmail: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  warranties: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  },
  createtAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('customers', CustomerSchema);
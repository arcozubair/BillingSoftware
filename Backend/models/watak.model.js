// models/Invoice.js
const mongoose = require('mongoose');

const watakSchema = new mongoose.Schema({
  watakNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  items: [{
    itemName: String,
    quantity: Number,
    weight: Number,
    rate: Number,
    total: Number,
  }],
  total: {
    type: Number,
    required: true,
  },
  expenses: {
    commission: {
      type: Number,
      default: 0,
    },
    commissionPercent: {
      type: Number,
      default: 0,
    },
    laborCharges: {
      type: Number,
      default: 0,
    },
    labor: {
      type: Number,
      default: 0,
    },
    vehicleCharges: {
      type: Number,
      default: 0,
    },
    otherCharges: {
      type: Number,
      default: 0,
    },
    bardan: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  netAmount: {
    type: Number,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
}, { timestamps: true });

// P
const Watak = mongoose.model('Watak', watakSchema);

module.exports = Watak;

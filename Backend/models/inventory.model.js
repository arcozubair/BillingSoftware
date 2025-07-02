const mongoose = require('mongoose');

// Purchase History Schema
const purchaseHistorySchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice', // Reference to Invoice model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true, // e.g., in kg or lbs
  },
  rate: {
    type: Number,
    required: true, // price per unit
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Item Schema
const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  quantityReceived: {
    type: Number,
    required: true,
  },
  remainingStock: {
    type: Number,
    required: true,
  },
  dateReceived: {
    type: Date,
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  vehicleCharges: {
    type: Number,
    default: 0,
  },
  bardan: {
    type: Number,
    default: 0,
  },
  purchaseHistory: [purchaseHistorySchema], // Embedded purchase history for each item
});

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [itemSchema], // Array of items
});

module.exports = mongoose.model('Inventory', inventorySchema);

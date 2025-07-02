// models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  items: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Store the ObjectId of the item from the Inventory's items array
    },
    itemName: String, // Storing the item name for convenience
    quantity: Number,
    weight: Number,
    rate: Number,
    total: Number,
  }],
  grandTotal: {
    type: Number,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
}, { timestamps: true },{ validateModifiedOnly: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;

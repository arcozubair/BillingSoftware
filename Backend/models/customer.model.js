// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A customer must have a name'],
    trim: true,
    unique: true,
  },
  lastBalance: {
    type: Number,
    default: 0,
  },
  invoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
},{ timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

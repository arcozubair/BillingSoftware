const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    required: true,
  },
  transactionMode: {
    type: String,
    enum: ['Cash', 'Account Transfer'],
    required: true,
  },
  receiptNumber: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
},{ timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

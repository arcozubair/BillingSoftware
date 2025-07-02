const mongoose = require('mongoose');

const watakTransactionSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
 
  transactionMode: {
    type: String,
    enum: ['Cash', 'Account Transfer'],
    required: true,
  },

  paymentDate: {
    type: Date,
    required: true,
  },
},{ timestamps: true });

const WatakTransaction = mongoose.model('WatakTransaction', watakTransactionSchema);

module.exports = WatakTransaction;

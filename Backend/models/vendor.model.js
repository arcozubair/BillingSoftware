const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ledgerBalance: {
    type: Number,
    required: true,
    default: 0, 
  },
  type: {
    type: String,
    required: true,
    enum: ['Local', 'Outsider'], 
  },
  wataks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watak',
  }],
  WatakTransaction: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatakTransaction'
  }]
});

module.exports = mongoose.model('Vendor', vendorSchema);

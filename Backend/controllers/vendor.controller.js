const Vendor = require('../models/vendor.model');
const catchAsync = require('../utils/catchAsync');
const numberToIndianWords = require('../utils/numToWords');
const numberToWords = require("number-to-words");

// Create a new vendor
exports.createVendor = async (req, res) => {
  try {
    const { name, ledgerBalance, type } = req.body;
    const newVendor = await Vendor.create({ name, ledgerBalance, type });
    res.status(201).json(newVendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a vendor by ID
exports.updateVendorById = async (req, res) => {
  try {
    const { name, ledgerBalance, type } = req.body;
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name, ledgerBalance, type },
      { new: true }
    );
    if (!updatedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(200).json(updatedVendor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a vendor by ID
exports.deleteVendorById = async (req, res) => {
  try {
    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!deletedVendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTotalVendorledger = catchAsync(async (req, res, next) => {
  try {
    const lastBalances = await Vendor.find({}).select('ledgerBalance');

    // Calculate the total sum of ledgerBalance
    const totalSum = lastBalances.reduce(
      (sum, item) => sum + item.ledgerBalance, // Use ledgerBalance instead of lastBalance
      0
    );

    // Convert the total sum to words
    const totalSumInIndianWords = numberToIndianWords(totalSum);
    const totalSumInInternationalWords = numberToWords.toWords(totalSum);

    // Respond with the calculated values
    res.status(200).json({
      message: "Total ledger balance calculated successfully",
      totalLedger: totalSum,
      totalLedgerInIndianWords: totalSumInIndianWords,
      totalLedgerInInternationalWords: totalSumInInternationalWords,
    });
  } catch (error) {
    console.error("Error calculating total ledger balance:", error);
    res.status(500).json({ message: "Error calculating total ledger balance", error });
  }
});


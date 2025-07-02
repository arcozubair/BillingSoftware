const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');

// Create a new vendor
router.post('/vendors', vendorController.createVendor);

// Get all vendors
router.get('/vendors', vendorController.getVendors);

// Get a specific vendor by ID
router.get('/vendors/:id', vendorController.getVendorById);

// Update a vendor by ID
router.put('/vendors/:id', vendorController.updateVendorById);

// Delete a vendor by ID
router.delete('/vendors/:id', vendorController.deleteVendorById);
router.get('/getTotalVendorledger', vendorController.getTotalVendorledger);


module.exports = router;

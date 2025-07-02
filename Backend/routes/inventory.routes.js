const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// Add items to inventory
router.post('/inventory/add', inventoryController.addItemToInventory);

// Get inventory by vendor ID
router.get('/inventory/:vendorId', inventoryController.getInventoryByVendor);

// Update inventory item stock
router.post('/update-inventory', inventoryController.updateInventoryItemStock);

// Delete an item from inventory
router.delete('/inventory/delete/', inventoryController.deleteInventoryItem);
router.get('/get-inventory', inventoryController.getAllInventory);
router.post('/restore-inventory', inventoryController.restoreInventory);
router.delete("/delete-inventory/:vendorId",inventoryController.deleteVendorInventory)
router.get('/total-items', inventoryController.getTotalItemsInInventory);



module.exports = router;

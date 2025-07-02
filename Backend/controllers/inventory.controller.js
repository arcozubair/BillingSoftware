const Customer = require("../models/customer.model");
const Inventory = require("../models/inventory.model");
const Invoice = require("../models/invoice.model");
const catchAsync = require("../utils/catchAsync");

// Add items to inventory
exports.addItemToInventory = async (req, res) => {
  try {
    const { vendorId, items, dateReceived,vehicleCharges,vehicleNumber,bardan } = req.body; // Extract dateReceived from the request

    // Map through items and add dateReceived to each item
    const updatedItems = items.map((item) => ({
      ...item,  
      vehicleCharges,
      bardan,
      vehicleNumber:vehicleNumber?vehicleNumber:"",
      dateReceived, // Assign dateReceived to each item
    }));

    const inventoryEntry = await Inventory.findOne({ vendorId });

    if (inventoryEntry) {
      // Update existing inventory entry
      inventoryEntry.items.push(...updatedItems); // Use spread to add items
      await inventoryEntry.save();
      res.status(200).json(inventoryEntry);
    } else {
      // Create new inventory entry
      const newInventory = await Inventory.create({
        vendorId,
        items: updatedItems, // Set items with dateReceived
      });
      res.status(201).json(newInventory);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get inventory items for a specific vendor
exports.getInventoryByVendor = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({
      vendorId: req.params.vendorId,
    }).populate("vendorId");
    if (!inventory) {
      return res
        .status(404)
        .json({ message: "No inventory found for this vendor" });
    }
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update inventory item stock and add purchase history
exports.updateInventoryItemStock = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const { itemId, quantity, weight, rate, invoiceId } = req.body;

    // Validate inputs
    if (isNaN(quantity) || isNaN(weight) || isNaN(rate)) {
      return res
        .status(400)
        .json({ message: "Invalid input for quantity, weight, or rate." });
    }

    // Find the inventory entry containing the item
    const inventory = await Inventory.findOne({ "items._id": itemId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Find the specific item in the inventory
    const item = inventory.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found in inventory" });
    }

    if (item.remainingStock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock for this item" });
    }

    // Deduct the sold quantity
    item.remainingStock -= quantity;

    // Create a new purchase history entry
    const purchaseEntry = {
      invoiceId,
      quantity,
      weight: weight || 0,
      rate,
      date: new Date(),
    };

    // Push purchaseEntry to the item's purchaseHistory
    item.purchaseHistory.push(purchaseEntry);

    await inventory.save();

    res
      .status(200)
      .json({ message: "Stock updated successfully", item, purchaseEntry });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an item from inventory
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.body;

    // Find the inventory entry containing the item
    const inventory = await Inventory.findOne({ "items._id": itemId });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Remove the item from the inventory
    inventory.items.pull(itemId);
    await inventory.save();

    res.status(204).send(); // No content response
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all inventory items
exports.getAllInventory = async (req, res) => {
  try {
    const inventories = await Inventory.find().populate("vendorId");

    // Filter out vendors with empty items
    const filteredInventories = inventories.filter(
      (inventory) => inventory.items.length > 0
    );

    res.status(200).json(filteredInventories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVendorInventory = async (req, res) => {
  try {
    const { vendorId } = req.params; // Use vendorId instead of VendorId

    // Assuming vendorId is a field in your Inventory schema
    await Inventory.findOneAndDelete({ vendorId });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Restore inventory and delete invoice
exports.restoreInventory = async (req, res) => {
  const { invoiceId,customerId } = req.body;

  console.log(
    `Attempting to restore inventory and delete invoice with ID: ${invoiceId}`
  );

  try {
    // Step 1: Find the invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      console.warn(`Invoice with ID ${invoiceId} not found`);
      return res.status(404).json({ message: "Invoice not found" });
    }

    console.log(`Invoice found:`, invoice);

    // Step 2: Find all inventories
    const inventories = await Inventory.find();
    console.log(`Total inventories found: ${inventories.length}`);

    let inventoryUpdated = false;

    // Step 3: Loop through each inventory
    for (const inventory of inventories) {
      console.log(`Processing inventory ID: ${inventory._id}`);

      // Step 4: Loop through each item in the inventory
      for (const item of inventory.items) {
        console.log(`Checking item: ${item.itemName} with ID: ${item._id}`);

        // Step 5: Find related purchase history entries
        const purchaseHistoryBefore = item.purchaseHistory.length;

        // Filter and update purchase history
        item.purchaseHistory = item.purchaseHistory.filter((purchaseEntry) => {
          console.log(
            `Comparing purchase entry invoice ID: ${purchaseEntry.invoiceId.toString()} with target invoice ID: ${invoiceId}`
          );
          if (purchaseEntry.invoiceId.toString() === invoiceId) {
            // Restore quantity to remaining stock
            item.remainingStock += purchaseEntry.quantity;
            console.log(
              `Restoring ${purchaseEntry.quantity} of item ID ${item._id} to inventory.`
            );
            return false; // Remove this entry from purchase history
          }
          return true; // Keep this entry
        });

        // Check if we actually updated the purchase history
        if (purchaseHistoryBefore !== item.purchaseHistory.length) {
          console.log(
            `Removed ${
              purchaseHistoryBefore - item.purchaseHistory.length
            } entries from purchase history for item ID: ${item._id}`
          );
          inventoryUpdated = true; // Mark that we updated the inventory
        }
      }

      // Save changes to the inventory if it was updated
      if (inventoryUpdated) {
        await inventory.save();
        console.log(`Inventory ID ${inventory._id} updated successfully.`);
      }
    }

    // Find the customer by ID
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Find the invoice by ID
  const invoiceToDelete = await Invoice.findById(invoiceId);
  if (!invoiceToDelete) {
    return next(new AppError('Invoice not found', 404));
  }

  // Update customer's last balance by subtracting the grand total of the invoice
  customer.lastBalance -= invoiceToDelete.grandTotal;


  // Save the updated customer
  await customer.save();

  // Delete the invoice
  await Invoice.findByIdAndDelete(invoiceId);

    res.status(204).send(); // No content response
  } catch (err) {
    console.error("Error restoring inventory and deleting invoice:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getTotalItemsInInventory = catchAsync(async (req, res, next) => {
  try {
    // Fetch all inventory documents
    const inventories = await Inventory.find();

    // Calculate the total number of items based on remaining stock
    const totalItems = inventories.reduce((total, inventory) => {
      return total + inventory.items.reduce((itemTotal, item) => {
        return itemTotal + item.remainingStock;
      }, 0);
    }, 0);

    res.status(200).json({
      message: 'Total items in inventory calculated successfully',
      totalItems,
    });
  } catch (error) {
    console.error('Error calculating total items in inventory:', error);
    res.status(500).json({ message: 'Error calculating total items in inventory', error });
  }
});
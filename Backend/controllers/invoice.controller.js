// controllers/invoiceController.js
const Customer = require('../models/customer.model');
const Invoice = require("../models/invoice.model")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { default: mongoose } = require('mongoose');
const Inventory = require("../models/inventory.model");

exports.addInvoice = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const { date, items, invoiceNumber } = req.body;

  console.log("add invoice ", req.body);
  console.log("cus", customerId);

  // Check if date is provided
  if (!date) {
    return next(new AppError("Date is required for the invoice", 400));
  }

  // Find the customer
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  // Calculate grandTotal from the items array
  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);

  // Create a new invoice
  const newInvoice = new Invoice({
    invoiceNumber,
    date,
    items,
    grandTotal,
    customer: customerId,
  });

  // Save the new invoice
  const savedInvoice = await newInvoice.save();

  

  // Update the customer's balance
  customer.lastBalance += grandTotal;

  // Save the updated customer
  await customer.save();

  res.status(200).json({
    message: "Invoice added successfully",
    invoiceId: savedInvoice._id, // Return the created invoice ID
    customer,
  });
});


exports.updateInvoice = catchAsync(async (req, res, next) => {
  const { date, items, invoiceNumber, customerId } = req.body.updatedInvoice;

  console.log("Updating invoice for customer:", req.body);
  console.log("Invoice number:", invoiceNumber);

  // Find the customer by ID
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError('Customer not found', 404));
  }

  // Find the invoice to update by matching the invoice number
  const invoiceToUpdate = await Invoice.findOne({ invoiceNumber, customer: customerId });
  if (!invoiceToUpdate) {
    return next(new AppError('Invoice not found', 404));
  }

  // Calculate old grand total
  const oldGrandTotal = invoiceToUpdate.grandTotal;

  // Update the invoice details with new data
  invoiceToUpdate.date = date;
  invoiceToUpdate.items = items;
  invoiceToUpdate.grandTotal = items.reduce((total, item) => total + parseFloat(item.total), 0);

  // Save the updated invoice
  await invoiceToUpdate.save();

  // Update the customer's last balance
  customer.lastBalance += (invoiceToUpdate.grandTotal - oldGrandTotal);

  // Save the updated customer details
  await customer.save();

  // Respond with the updated customer information
  res.status(200).json({ message: 'Invoice updated successfully', customer });
});

exports.deleteInvoice = catchAsync(async (req, res, next) => {
  const { invoiceId, customerId } = req.params;

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

  // Remove the invoice ID from the customer's invoices array
  customer.invoices.pull(invoiceToDelete._id);

  // Save the updated customer
  await customer.save();

  // Delete the invoice
  await Invoice.findByIdAndDelete(invoiceId);

  res.status(204).json({ message: 'Invoice deleted successfully' });
});


// exports.addInvoiceAndUpdateInventory = catchAsync(async (req, res, next) => {
//   const { customerId } = req.params;
//   const { date, items, invoiceNumber } = req.body;

//   if (!date) {
//     return next(new AppError("Date is required for the invoice", 400));
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Find the customer
//     const customer = await Customer.findById(customerId).session(session);
//     if (!customer) {
//       throw new AppError("Customer not found", 404);
//     }

//     // Calculate grandTotal from the items array
//     const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);

//     // Create a new invoice
//     const newInvoice = new Invoice({
//       invoiceNumber,
//       date,
//       items,
//       grandTotal,
//       customer: customerId,
//     });

//     // Save the new invoice
//     const savedInvoice = await newInvoice.save({ session });

//     // Add the new invoice to the customer's invoices array
//     customer.invoices.push(savedInvoice._id);

//     // Update the customer's balance
//     customer.lastBalance += grandTotal;

//     // Save the updated customer
//     await customer.save({ session });

//     // Update inventory items
//     for (const item of items) {
//       const { id: itemId, quantity, weight, rate } = item;

//       // Find the inventory entry containing the item
//       const inventory = await Inventory.findOne({ "items._id": itemId }).session(session);
//       if (!inventory) {
//         throw new Error(`Inventory item not found`);
//       }

//       // Find the specific item in the inventory
//       const inventoryItem = inventory.items.id(itemId);
//       if (!inventoryItem) {
//         throw new Error(`Item not found in inventory`);
//       }

//       if (inventoryItem.remainingStock < quantity) {
//         throw new Error(`Insufficient stock for item ${inventoryItem.itemName}`);
//       }


//       // Deduct the sold quantity
//       inventoryItem.remainingStock -= quantity;

//       // Create a new purchase history entry
//       const purchaseEntry = {
//         invoiceId: savedInvoice._id,
//         quantity,
//         weight: weight || 0,
//         rate,
//         date: new Date(),
//       };

//       // Push purchaseEntry to the item's purchaseHistory
//       inventoryItem.purchaseHistory.push(purchaseEntry);

//       await inventory.save({ session });
//     }

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(200).json({
//       message: "Invoice added and inventory updated successfully",
//       invoiceId: savedInvoice._id,
//       customer,
//     });
//   } catch (error) {
//     // Rollback the transaction if an error occurs
//     await session.abortTransaction();
//     session.endSession();
//     return next(new AppError(error.message, 400));
//   }
// });

exports.addInvoiceAndUpdateInventory = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const { date, items, invoiceNumber } = req.body;

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59

  if (!date) {
    return next(new AppError("Date is required for the invoice", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the customer
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    // Check if an invoice already exists for the same customer on the same date
    let existingInvoice = await Invoice.findOne({
      customer: customerId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).session(session);

    let grandTotal;
    let savedInvoice;
    let newItemsTotal;

    if (existingInvoice) {
      // If an invoice exists, calculate the total for the new items
      newItemsTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);

      // Merge the new items into the existing invoice
      existingInvoice.items.push(...items);

      // Recalculate the grand total for the entire invoice (including both old and new items)
      grandTotal = existingInvoice.items.reduce((sum, item) => sum + parseFloat(item.total), 0);

      // Update the grand total of the existing invoice
      existingInvoice.grandTotal = grandTotal;

      // Save the updated invoice
      savedInvoice = await existingInvoice.save({ session });
    } else {
      // Calculate grand total from the new items array for the new invoice
      newItemsTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
      grandTotal = newItemsTotal;

      // Create a new invoice
      const newInvoice = new Invoice({
        invoiceNumber,
        date,
        items,
        grandTotal,
        customer: customerId,
      });

      // Save the new invoice
      savedInvoice = await newInvoice.save({ session });

     
    }

    // Update the customer's balance by only adding the total for the new items
    customer.lastBalance += newItemsTotal;

    // Save the updated customer
    await customer.save({ session });

    // Update inventory items
    for (const item of items) {
      const { id: itemId, quantity, weight, rate } = item;

      // Validate for negative values of quantity, weight, and rate
      if (quantity <= 0) {
        throw new Error(`Quantity for item ${itemId} cannot be zero or negative.`);
      }
      if (weight < 0) {
        throw new Error(`Weight for item ${itemId} cannot be negative.`);
      }
      if (rate <= 0) {
        throw new Error(`Rate for item ${itemId} cannot be zero or negative.`);
      }

      // Find the inventory entry containing the item
      const inventory = await Inventory.findOne({ "items._id": itemId }).session(session);
      if (!inventory) {
        throw new Error(`Inventory item not found`);
      }

      // Find the specific item in the inventory
      const inventoryItem = inventory.items.id(itemId);
      if (!inventoryItem) {
        throw new Error(`Item not found in inventory`);
      }

      if (inventoryItem.remainingStock < quantity) {
        throw new Error(`Insufficient stock for item ${inventoryItem.itemName}`);
      }

      // Deduct the sold quantity
      inventoryItem.remainingStock -= quantity;

      // Create a new purchase history entry
      const purchaseEntry = {
        invoiceId: savedInvoice._id,
        quantity,
        weight: weight || 0,
        rate,
        date: new Date(),
      };

      // Push purchaseEntry to the item's purchaseHistory
      inventoryItem.purchaseHistory.push(purchaseEntry);

      await inventory.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Invoice added and inventory updated successfully",
      invoiceId: savedInvoice._id,
      customer,
    });
  } catch (error) {
    // Rollback the transaction if an error occurs
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 400));
  }
});


exports.getInvoicesBydate = catchAsync(async (req, res, next) => {
  
  // Get today's date in UTC
  const {date} = req.query;

  const dateObj = new Date(date);

  // Set the time to midnight to ensure the correct date range is queried
  dateObj.setUTCHours(0, 0, 0, 0);
  
  // Query for invoices on that date
  const todaysInvoices = await Invoice.find({
    date: {
      $gte: dateObj,
      $lt: new Date(dateObj.getTime() + 86400000), // Add 24 hours to cover the entire day
    }
  }).populate('customer');

  // Initialize array to store today's invoices details
  const invoiceDetails = [];

  // Iterate over each invoice to extract details
  todaysInvoices.forEach(invoice => {
    invoiceDetails.push({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date, // Use createdAt for the date
      items: invoice.items, // Include items array
      balance: invoice.grandTotal, // Assuming balance is the grandTotal
      _id: invoice._id,
      customerName: invoice.customer.name,
      customerId: invoice.customer._id, // Include customer ID
      lastBalance: invoice.customer.lastBalance // Include lastBalance from customer
    });
  });

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      invoices: invoiceDetails // Return the detailed invoices
    }
  });
});

exports.updateInvoiceAndAdjustInventory = catchAsync(async (req, res, next) => {
  const { invoiceId } = req.params;
  const { updatedInvoice } = req.body;
  const { date, items, invoiceNumber, customerId } = updatedInvoice;

  if (!date || !items || !invoiceNumber) {
    return next(new AppError("All invoice details are required", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the old invoice and customer
    const oldInvoice = await Invoice.findById(invoiceId).session(session);
    if (!oldInvoice) {
      throw new AppError("Old invoice not found", 404);
    }

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    // Step 2: Restore inventory based on the old invoice
    for (const item of oldInvoice.items) {
      const inventory = await Inventory.findOne({ "items._id": item.id }).session(session);
      if (!inventory) {
        throw new Error(`Inventory item not found for item ID ${item.id}`);
      }

      const inventoryItem = inventory.items.id(item.id);
      if (!inventoryItem) {
        throw new Error(`Item not found in inventory for item ID ${item.id}`);
      }

      inventoryItem.remainingStock += item.quantity;

      // Remove old purchase history entries
      inventoryItem.purchaseHistory = inventoryItem.purchaseHistory.filter(
        (purchaseEntry) => purchaseEntry.invoiceId.toString() !== oldInvoice._id.toString()
      );

      await inventory.save({ session });
    }

    // Step 3: Delete the old invoice
    await Invoice.findByIdAndDelete(invoiceId).session(session);

    // Step 4: Adjust the customer's balance
    customer.lastBalance -= oldInvoice.grandTotal;

    // Step 5: Create a new invoice
    const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const newInvoice = new Invoice({
      invoiceNumber,
      date,
      items,
      grandTotal,
      customer: customerId,
    });

    const savedInvoice = await newInvoice.save({ session });

    // Add the new invoice to the customer's invoices array
    customer.lastBalance += grandTotal;

    await customer.save({ session });

    // Step 6: Update inventory with new invoice details
    for (const item of items) {
      const { id: itemId, quantity, weight, rate } = item;

      const inventory = await Inventory.findOne({ "items._id": itemId }).session(session);
      if (!inventory) {
        throw new Error(`Inventory item not found for item ID ${itemId}`);
      }

      const inventoryItem = inventory.items.id(itemId);
      if (!inventoryItem) {
        throw new Error(`Item not found in inventory for item ID ${itemId}`);
      }

      if (inventoryItem.remainingStock < quantity) {
        throw new Error(`Insufficient stock for item ${inventoryItem.itemName}`);
      }

      inventoryItem.remainingStock -= quantity;

      const purchaseEntry = {
        invoiceId: savedInvoice._id,
        quantity,
        weight: weight || 0,
        rate,
        date: new Date(),
      };

      inventoryItem.purchaseHistory.push(purchaseEntry);

      await inventory.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Invoice updated and inventory restored successfully",
      invoiceId: savedInvoice._id,
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 400));
  }
});


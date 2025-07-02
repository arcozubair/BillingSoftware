// controllers/invoiceController.js
const Vendor = require('../models/vendor.model');
const Watak = require("../models/watak.model");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const WatakTransaction = require('../models/watakTransaction');
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const numberToIndianWords = require('../utils/numToWords');

// Add a new Watak
exports.addWatak = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const {
    watakNumber,
    vehicleNumber,
    date,
    items,
    netAmount,
    expenses,
    grandTotal,
    expensesBreakDown,
  } = req.body.invoice; // Accessing date inside invoice

  // Check if date is provided
  if (!date) {
    return next(new AppError("Date is required for the invoice", 400));
  }

  // Find the vendor
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  // Create a new Watak
  const newWatak = new Watak({
    watakNumber: watakNumber,
    date,
    items,
    netAmount,
    vehicleNumber,
    expenses: {
      commission: expensesBreakDown.commissionAmount || 0,
      commissionPercent: expensesBreakDown.commissionPercent || 0,
      laborCharges: expensesBreakDown.laborCost || 0,
      labor: expensesBreakDown.labor || 0,
      vehicleCharges: expensesBreakDown.vehicleCharges || 0,
      otherCharges: expensesBreakDown.otherCharges || 0,
      bardan: expensesBreakDown.bardan || 0,
      total: expenses,
    },
    total: grandTotal,
    vendor: vendorId,
  });

  // Save the new Watak
  const savedWatak = await newWatak.save();

  

  // Update the vendor's balance
  vendor.ledgerBalance += netAmount;

  // Save the updated vendor
  await vendor.save();

  res.status(200).json({
    message: "Watak added successfully",
    watakId: savedWatak._id,
    vendor,
  });
});
// Update Watak
exports.updateWatak = catchAsync(async (req, res, next) => {
  const { watakId } = req.params;
  const editedWatak = req.body.updatedWatak;

  // Log the editedWatak for debugging
  console.log("Edited Watak:", editedWatak);

  // Validate the request body
  if (!watakId || !editedWatak) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid data. Watak ID and editedWatak are required.",
    });
  }

  // Find the vendor and check if it exists
  const vendor = await Vendor.findById(editedWatak.vendorId);
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  // Prepare update operations
  const updateWatakPromise = Watak.findByIdAndUpdate(
    watakId,
    {
      watakNumber: editedWatak.watakNumber,
      vehicleNumber: editedWatak.vehicleNumber,
      date: editedWatak.date,
      items: editedWatak.items,
      netAmount: editedWatak.netAmount,
      expenses: {
        commission: editedWatak.expenses.commission || 0,
        commissionPercent: editedWatak.expenses.commissionPercent || 0,
        laborCharges: editedWatak.expenses.laborCharges || 0,
        labor: editedWatak.expenses.labor || 0,
        vehicleCharges: editedWatak.expenses.vehicleCharges || 0,
        otherCharges: editedWatak.expenses.otherCharges || 0,
        bardan: editedWatak.expenses.bardan || 0,
        total: editedWatak.expenses.total || 0,
      },
      vendor: editedWatak.vendorId,
    },
    {
      new: true, // Return the updated document
      runValidators: true, // Validate fields according to the schema
    }
  );

  // Update the vendor's ledger balance
  const updateVendorPromise = Vendor.findByIdAndUpdate(
    editedWatak.vendorId,
    { ledgerBalance: editedWatak.ledgerBalance },
    { new: true }
  );

  try {
    // Run both promises in parallel
    const [updatedWatak, updatedVendor] = await Promise.all([
      updateWatakPromise,
      updateVendorPromise,
    ]);

    // Check if Watak was updated
    if (!updatedWatak) {
      return res.status(404).json({
        status: "fail",
        message: "Watak not found",
      });
    }

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        watak: updatedWatak,
        vendor: updatedVendor,
      },
    });
  } catch (error) {
    // Handle any errors that occur during the promises
    console.error("Error updating Watak or Vendor:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update Watak and Vendor. Please try again.",
    });
  }
});

// Delete a Watak
exports.deleteWatak = catchAsync(async (req, res, next) => {
  const { watakId, vendorId } = req.params;

  // Find the vendor by ID
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  // Find the Watak by ID
  const watakToDelete = await Watak.findById(watakId);
  if (!watakToDelete) {
    return next(new AppError("Watak not found", 404));
  }

  // Update the vendor's ledger balance
  vendor.ledgerBalance -= watakToDelete.netAmount;

  // Remove the Watak ID from the vendor's wataks array
  vendor.wataks.pull(watakToDelete._id);

  // Save the updated vendor
  await vendor.save();

  // Delete the Watak
  await Watak.findByIdAndDelete(watakId);

  res.status(204).json({ message: "Watak deleted successfully" });
});

// Get today's Wataks
exports.getTodaysWataks = catchAsync(async (req, res, next) => {
  // Get today's date in UTC
  const today = new Date();
  const startOfDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0,
      0,
      0
    )
  ); // Start of today in UTC
  const endOfDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23,
      59,
      59,
      999
    )
  ); // End of today in UTC

  // Fetch Wataks created today, and only populate if the vendor exists
  const todaysWataks = await Watak.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  }).populate({
    path: "vendor",
    match: { _id: { $ne: null } }, // Only match if the vendor exists
  });

  // Initialize array to store today's Wataks details
  const watakDetails = [];

  // Iterate over each Watak to extract details
  todaysWataks.forEach((watak) => {
    // Only add Watak details if the vendor still exists
    if (watak.vendor) {
      watakDetails.push({
        watakNumber: watak.watakNumber,
        vehicleNumber: watak.vehicleNumber,
        date: watak.date,
        items: watak.items,
        netAmount: watak.netAmount,
        _id: watak._id,
        vendorType: watak.vendor.type,
        vendorName: watak.vendor.name,
        vendorId: watak.vendor._id, // Include vendor ID
        ledgerBalance: watak.vendor.ledgerBalance, // Include vendor's ledger balance
        expenses: {
          commission: watak.expenses.commission,
          commissionPercent: watak.expenses.commissionPercent,
          laborCharges: watak.expenses.laborCharges,
          labor: watak.expenses.labor,
          vehicleCharges: watak.expenses.vehicleCharges,
          otherCharges: watak.expenses.otherCharges,
          bardan: watak.expenses.bardan,
          total: watak.expenses.total,
        }, // Include detailed expenses breakdown
      });
    }
  });

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      watak: watakDetails,
    },
  });
});


exports.getWataksBydate = catchAsync(async (req, res, next) => {
  // Get the date from query parameters
  const { date } = req.query;

  const dateObj = new Date(date);

  // Set the time to midnight to ensure the correct date range is queried
  dateObj.setUTCHours(0, 0, 0, 0);

  // Query for Wataks on that date, only including existing vendors
  const todaysWataks = await Watak.find({
    date: {
      $gte: dateObj,
      $lt: new Date(dateObj.getTime() + 86400000), // Add 24 hours to cover the entire day
    },
  }).populate({
    path: "vendor",
    match: { _id: { $ne: null } }, // Only match if the vendor exists
  });

  // Initialize array to store today's Wataks details
  const watakDetails = [];

  // Iterate over each Watak to extract details
  todaysWataks.forEach((watak) => {
    // Only add Watak details if the vendor still exists
    if (watak.vendor) {
      watakDetails.push({
        watakNumber: watak.watakNumber,
        vehicleNumber: watak.vehicleNumber,
        date: watak.date,
        items: watak.items,
        netAmount: watak.netAmount,
        _id: watak._id,
        vendorType: watak.vendor.type,
        vendorName: watak.vendor.name,
        vendorId: watak.vendor._id, // Include vendor ID
        ledgerBalance: watak.vendor.ledgerBalance, // Include vendor's ledger balance
        expenses: {
          commission: watak.expenses.commission,
          commissionPercent: watak.expenses.commissionPercent,
          laborCharges: watak.expenses.laborCharges,
          labor: watak.expenses.labor,
          vehicleCharges: watak.expenses.vehicleCharges,
          otherCharges: watak.expenses.otherCharges,
          bardan: watak.expenses.bardan,
          total: watak.expenses.total,
        }, // Include detailed expenses breakdown
      });
    }
  });

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      watak: watakDetails,
    },
  });
});

// Make Vendor Payment
exports.watakPayment = catchAsync(async (req, res, next) => {
  const { amount, transactionMode, secretCode } = req.body;
  const vendorId = req.params.vendorId;

  try {
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    if (!secretCode || typeof secretCode !== "string") {
      return res.status(400).json({ error: "Secret code is required and must be a string" });
    }

    const isMatch = await bcrypt.compare(secretCode, adminUser.secretCode);

    if (!isMatch) {
      return res.status(401).json({ error: "Secret code does not match" });
    }

    if (isNaN(parseFloat(amount)) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const newBalance = vendor.ledgerBalance - parseFloat(amount);

  

    // Update vendor's balance
    vendor.ledgerBalance = newBalance;

    // Create transaction object without receipt and discount
    const transaction = new WatakTransaction({
      vendorId: vendor._id,
      amount: parseFloat(amount),
      transactionMode,
      paymentDate: new Date(),
    });

    await transaction.save();


    await vendor.save();

    res.json({
      message: "Payment successfully processed",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        balance: vendor.ledgerBalance, // Updated the balance here
        lastTransaction: transaction,
      },
    });
  } catch (error) {
    console.error("Error making payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get Vendor Ledger
exports.getVendorLedger = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const { from } = req.query;

  // Validate from
  if (!from || isNaN(Date.parse(from))) {
    return res.status(400).json({ error: 'Valid from is required' });
  }

  const startDate = new Date(from);
  const endDate = new Date(); // Current date

  try {
    // Fetch the vendor
    const vendor = await Vendor.findById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Fetch wataks and transactions between fromDate and toDate
    const wataks = await Watak.find({ 
      vendor: vendorId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const transactions = await WatakTransaction.find({ 
      vendorId: vendorId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
console.log("ttt",transactions);
    // Calculate total wataks and transactions after fromDate
    const totalWataks = wataks.reduce((total, watak) => total + watak.netAmount, 0);
    const totalTransactions = transactions.reduce((total, tx) => total + tx.amount, 0);
    console.log("hey",totalWataks,totalTransactions);

    // Starting balance: ledgerBalance adjusted by entries after fromDate
    const adjustedStartingBalance = (vendor.ledgerBalance || 0) - (totalWataks - totalTransactions);

    // Prepare ledger entries using createdAt for both wataks and transactions
    const watakEntries = wataks.map(watak => ({
      date: watak.createdAt,
      actualDate: watak.date,
      type: 'Watak',
      description: `Watak #${watak.watakNumber} - Created on ${watak.createdAt.toDateString()} ${watak.createdAt.toLocaleTimeString()}`,
      amount: watak.netAmount,
    }));

    const transactionEntries = transactions.map(tx => ({
      date: tx.createdAt,
      actualDate: tx.paymentDate,
      type: 'Transaction',
      description: `Transaction - Created on ${tx.createdAt.toDateString()} ${tx.createdAt.toLocaleTimeString()}`,
      amount: tx.amount,
      transactionMode: tx.transactionMode,
    }));

    // Combine all ledger entries
    let ledgerEntries = [...watakEntries, ...transactionEntries];

    // Sort ledger entries by created date in ascending order
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Initialize balance with the adjusted starting balance
    let currentBalance = adjustedStartingBalance;

    // Calculate the ledger details
    const ledgerDetails = ledgerEntries.map(entry => {
      // Update balance based on the type of entry
      if (entry.type === 'Watak') {
        currentBalance += entry.amount; // Add watak amount to balance
      } else if (entry.type === 'Transaction') {
        currentBalance -= entry.amount; // Subtract transaction amount from balance
      }

      return {
        date: entry.actualDate,
        type: entry.type,
        description: entry.description,
        amount: entry.type === 'Watak' ? entry.amount : -entry.amount, // Negative for transactions
        balanceAfterEntry: currentBalance,
        transactionMode: entry.transactionMode || null,
      };
    });

    // The ending balance is the currentBalance after all ledger entries
    const endingBalance = currentBalance;

    res.json({
      startingBalance: adjustedStartingBalance,
      ledgerDetails,
      endingBalance,
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

exports.getTodaysVendorTrans = catchAsync(async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Start of today (midnight UTC)

    // Query transactions for today, including customer details
    const transactions = await WatakTransaction.find({
      paymentDate: { $gte: today }
    }).populate('vendorId', 'name'); // Populate customer name from Customer model
   
  
    // Calculate total sum of transactions made today
    const totalSum = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const cash = transactions
    .filter(transaction => transaction.transactionMode === 'Cash')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const accountPayment = totalSum-cash;
  console.log("Today's cash:", cash,accountPayment);
    // Convert totalSum to Indian words
    const totalInWords = numberToIndianWords(totalSum);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        totalSum,
        totalInWords,
        cash,
        accountPayment
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch today\'s transactions'
    });
  }
});
exports.getYesterdayVendorTrans = catchAsync(async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to midnight

    // Calculate the start of yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Query transactions for yesterday for the specified vendor, including customer details
    const transactions = await WatakTransaction.find({
      paymentDate: { $gte: yesterday, $lt: today }
    }).populate('vendorId', 'name'); // Populate vendor name from Vendor model

     
    // Calculate total sum of transactions made today
    const totalSum = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const cash = transactions
    .filter(transaction => transaction.transactionMode === 'Cash')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const accountPayment = totalSum-cash;
  console.log("Today's cash:", cash,accountPayment);
    // Convert totalSum to Indian words
    const totalInWords = numberToIndianWords(totalSum);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        totalSum,
        totalInWords,
        cash,
        accountPayment
      }
    });
  } catch (error) {
    console.error('Error fetching Yesterdays\'s transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Yesterdays\'s transactions'
    });
  }
});


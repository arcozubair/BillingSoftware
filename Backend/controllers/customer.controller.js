// controllers/customerController.js
const Customer = require("../models/customer.model");
const Transaction = require("../models/transaction.model");
const bcrypt = require("bcryptjs");
const Invoice = require("../models/invoice.model")

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const numberToWords = require("number-to-words");
const numberToIndianWords = require ("../utils/numToWords");
const { default: mongoose } = require("mongoose");

// Utility function to capitalize first letter of each word
const capitalizeFirstLetter = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

exports.addCustomer = catchAsync(async (req, res, next) => {
  const { name, lastBalance } = req.body;

  // Capitalize the first letter of each word in the name
  const formattedName = capitalizeFirstLetter(name);

  // Set lastBalance to 0 if it is not provided
  const customerLastBalance = lastBalance || 0;

  const newCustomer = new Customer({
    name: formattedName,
    lastBalance: customerLastBalance,
    invoices: [],
  });

  await newCustomer.save();

  res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
});


exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.find();

  res.status(200).json({
    status: "success",
    results: customers.length,
    data: {
      customers,
    },
  });
});

exports.makePayment = catchAsync(async (req, res, next) => {
  const { amount, discountAmount,transactionMode, receiptNumber, secretCode } =
    req.body;
  const customerId = req.params.customerId;


  try {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    if (!secretCode || typeof secretCode !== "string") {
      return res
        .status(400)
        .json({ error: "Secret code is required and must be a string" });
    }
    const isMatch = await bcrypt.compare(secretCode, adminUser.secretCode);

    if (!isMatch) {
      return res.status(401).json({ error: "Secret code does not match" });
    }

    if (isNaN(parseFloat(amount)) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const newBalance = customer.lastBalance - (parseFloat(amount)+parseFloat(discountAmount)) ;

   
    // Update customer's balance
    customer.lastBalance = newBalance;

    // Create transaction object
    const transaction = new Transaction({
      customerId: customer._id,
      amount: parseFloat(amount),
      transactionMode,
      receiptNumber,
      discountAmount,
      paymentDate: new Date(),
    });

    await transaction.save();


    await customer.save();

    res.json({
      message: "Payment successfully processed",
      customer: {
        id: customer._id,
        name: customer.name,
        balance: customer.balance,
        lastTransaction: transaction,
      },
    });
  } catch (error) {
    console.error("Error making payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.viewTransactions = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;

  // Step 1: Fetch the customer
  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Step 2: Fetch related transactions
  const transactions = await Transaction.find({ customerId }).lean();

  // Step 3: Return full customer info with transactions
  res.status(200).json({
    ...customer,
    transactions,
  });
});


exports.getTodaysInvoices = catchAsync(async (req, res, next) => {
  // Get today's date in UTC
  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0)); // Start of today in UTC
  const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999)); // End of today in UTC

  // Fetch invoices created today
  const todaysInvoices = await Invoice.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  }).populate('customer');
console.log(todaysInvoices)

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
      customerName: invoice.customer?.name,
      customerId: invoice.customer?._id, // Include customer ID
      lastBalance: invoice.customer?.lastBalance // Include lastBalance from customer
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


// exports.getTotalLedger = catchAsync(async (req, res, next) => {
//   try {
//     const lastBalances = await Customer.find().select("lastBalance");

//     const totalSum = lastBalances.reduce(
//       (sum, item) => sum + item.lastBalance,
//       0
//     );

//     res
//       .status(200)
//       .json({
//         message: "Total ledger balance calculated successfully",
//         totalLedger: totalSum,
//       });
//   } catch (error) {
//     console.error("Error calculating total ledger balance:", error);
//     res
//       .status(500)
//       .json({ message: "Error calculating total ledger balance", error });
//   }
// });



exports.getTotalLedger = catchAsync(async (req, res, next) => {
  try {
    // Fetch all customers except the one named "Cash"
    const lastBalances = await Customer.find({ 'name': { $ne: 'Cash' } }).select('lastBalance');

    // Calculate the total sum of lastBalance
    const totalSum = lastBalances.reduce(
      (sum, item) => sum + item.lastBalance,
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
    res
      .status(500)
      .json({ message: "Error calculating total ledger balance", error });
  }
});


exports.getCustomerLedger = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const { from } = req.query;

  // Validate from
  if (!from || isNaN(Date.parse(from))) {
    return res.status(400).json({ error: 'Valid from is required' });
  }

  const startDate = new Date(from);
  const endDate = new Date(); // Current date

  try {
    // Fetch the customer
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch invoices and transactions between fromDate and toDate for ledger
    const invoices = await Invoice.find({ 
      customer: customerId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    const transactions = await Transaction.find({ 
      customerId: customerId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate adjustments after fromDate
    const invoicesAfter = invoices.reduce((total, inv) => total + inv.grandTotal, 0);
    const transactionsAfter = transactions.reduce((total, tx) => 
      total + tx.amount + (tx.discountAmount || 0), 0
    );

    // Starting balance: customer.lastBalance adjusted by entries after fromDate
    const adjustedStartingBalance = (customer.lastBalance || 0) - (invoicesAfter - transactionsAfter);

    // Prepare ledger entries using createdAt for both invoices and transactions
    const invoiceEntries = invoices.map(inv => ({
      date: inv.createdAt,
      actualDate: inv.date,
      type: 'Invoice',
      description: `Invoice #${inv.invoiceNumber} - Created on ${inv.createdAt.toDateString()} ${inv.createdAt.toLocaleTimeString()}`,
      amount: inv.grandTotal,
    }));

    const transactionEntries = transactions.map(tx => ({
      date: tx.createdAt,
      actualDate: tx.paymentDate,
      type: 'Transaction',
      description: `Transaction - Receipt #${tx.receiptNumber} - Created on ${tx.createdAt.toDateString()} ${tx.createdAt.toLocaleTimeString()}`,
      amount: tx.amount + (tx.discountAmount || 0),
      transactionMode: tx.transactionMode,
    }));

    // Combine all ledger entries
    let ledgerEntries = [...invoiceEntries, ...transactionEntries];

    // Sort ledger entries by created date in ascending order
    ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Initialize balance with the adjusted starting balance
    let currentBalance = adjustedStartingBalance;

    // Calculate the ledger details
    const ledgerDetails = ledgerEntries.map(entry => {
      // Update balance based on the type of entry
      if (entry.type === 'Invoice') {
        currentBalance += entry.amount;
      } else if (entry.type === 'Transaction') {
        currentBalance -= entry.amount;
      }

      return {
        date: entry.actualDate,
        type: entry.type,
        description: entry.description,
        amount: entry.type === 'Transaction' ? -entry.amount : entry.amount,
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





exports.getInvoices = catchAsync(async (req, res, next) => {
  // Get the current date
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

  // Fetch invoices created today
  const todaysIn = await Invoice.find({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  }).populate('customer');
  const filteredInv= todaysIn.filter(customer => customer.customer.name === "Cash")
  const sum = filteredInv.reduce((total, item) => total + item.grandTotal, 0);
const todaysInvoices = todaysIn.filter(customer => customer.customer.name != "Cash")

  // Initialize array to store today's invoices details
  const invoiceDetails = [];
  let totalAmount = 0;

  // Iterate over each invoice to extract details
  todaysInvoices.forEach(invoice => {
    invoiceDetails.push({
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt, // Use createdAt for the date
      grandTotal: invoice.grandTotal
    });
    // Sum the total amount of today's invoices
    totalAmount += invoice.grandTotal;
  });

  // Convert the total amount to words
  const totalAmountInWords = numberToIndianWords(totalAmount);
  const totalCashInWords = numberToIndianWords(sum);


  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      totalAmount,
      totalAmountInWords,
      todaysInvoices: invoiceDetails ,
      todaysCashInvoices : sum,
      totalCashInWords
    }
  });
});
exports.getTodaysTrans = catchAsync(async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Start of today (midnight UTC)

    // Query transactions for today, including customer details
    const transactions = await Transaction.find({
      paymentDate: { $gte: today }
    }).populate('customerId', 'name'); // Populate customer name from Customer model
   
  
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
exports.getYesterdayTrans = catchAsync(async (req, res, next) => {
  try {
    // Get the current date and set the time to midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Calculate the start of yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Query transactions for yesterday, including customer details
    const transactions = await Transaction.find({
      paymentDate: { $gte: yesterday, $lt: today }
    }).populate('customerId', 'name'); // Populate customer name from Customer model

    // Calculate total sum of transactions made yesterday
    const totalSum = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const cash = transactions
    .filter(transaction => transaction.transactionMode === 'Cash')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const accountPayment = totalSum-cash;
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
    console.error('Error fetching yesterday\'s transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch yesterday\'s transactions'
    });
  }
});


exports.getYesterdayInvoices = async (req, res) => {
  try {
    // Get the current date and set the time to midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Calculate the start of yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Find invoices created yesterday
    const yesterdaysInvoices = await Invoice.find({
      createdAt: { $gte: yesterday, $lt: today },
    }).populate('customer');

    // Format the invoices to include necessary details
    const formattedInvoices = yesterdaysInvoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.createdAt, // Use createdAt for the date
      items: invoice.items, // Include items array
      balance: invoice.grandTotal, // Assuming balance is the grandTotal
      _id: invoice._id,
      customerName: invoice.customer.name,
      customerId: invoice.customer._id,
      lastBalance: invoice.customer.lastBalance,
    }));

    res.status(200).json({ status: 'success', data: { invoices: formattedInvoices } });
  } catch (error) {
    console.error("Error retrieving yesterday's invoices:", error);
    res.status(500).json({ status: 'error', message: "Error retrieving yesterday's invoices" });
  }
};

exports.getCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.find();

  res.status(200).json({
    status: "success",
    results: customers.length,
    data: {
      customers,
    },
  });
});


exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  console.log(customerId);
  
  // Ensure customerId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return next(new AppError('Invalid customer ID', 400));
  }

  const customer = await Customer.findByIdAndDelete(customerId);

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  // Delete related transactions
  await Transaction.deleteMany({ customerId: customerId });

  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const { customerId } = req.params;
  const updates = req.body;
  
  // Ensure customerId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return next(new AppError('Invalid customer ID', 400));
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(customerId, updates, {
    new: true, // Return the updated document
    runValidators: true // Run schema validators on updates
  });

  if (!updatedCustomer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      customer: updatedCustomer
    }
  });
});
exports.getInvoicesOfCustomer = catchAsync(async (req, res, next) => {
  const { startDate, endDate, customerId } = req.body;

  console.log("hey",startDate,endDate,customerId);

  // Ensure that startDate, EndDate, and CustomerId are provided
  if (!startDate || !endDate || !customerId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide startDate, EndDate, and CustomerId.'
    });
  }

  // Convert startDate and EndDate to Date objects for proper comparison
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure end date includes the full day by adding 1 day to the EndDate
  end.setDate(end.getDate() + 1);

  // Fetch invoices created within the given date range and for the specific customer
  const invoices = await Invoice.find({
    customer: customerId,
    date: { $gte: start, $lt: end }
  }).populate('customer');

 
  const invoiceDetails = [];

  // Iterate over each invoice to extract details
  invoices.forEach(invoice => {
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

exports.getInactiveHighBalanceCustomers = catchAsync(async (req, res, next) => {
  // Calculate date 12 days ago
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setDate(twelveMonthsAgo.getDate() - 12);

  // Find customers with balance > 50000
  const customers = await Customer.find({
    lastBalance: { $gt: 50000 }
  });

  console.log(`Found ${customers.length} customers with balance > 50000`);

  const customersWithDetails = await Promise.all(
    customers.map(async (customer) => {
      // Fetch last invoice
      const lastInvoice = await Invoice.findOne({
        customer: customer._id
      }).sort({ createdAt: -1 });

      // Fetch last transaction directly from Transaction model
      const lastTransaction = await Transaction.findOne({
        customerId: customer._id
      }).sort({ paymentDate: -1 });

      const lastTransactionDate = lastTransaction ? lastTransaction.paymentDate : null;

      // Calculate days since last transaction
      const daysSinceLastTransaction = lastTransactionDate
        ? Math.floor((new Date() - new Date(lastTransactionDate)) / (1000 * 60 * 60 * 24))
        : null;

      // Format dates for response
      const formattedLastTransactionDate = lastTransactionDate
        ? new Date(lastTransactionDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          })
        : 'No payment history';

      const formattedLastInvoiceDate = lastInvoice?.createdAt
        ? new Date(lastInvoice.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
          })
        : 'No invoices';

      // Only include if no transaction in last 12 days
      if (daysSinceLastTransaction === null || daysSinceLastTransaction >= 12) {
        return {
          customerId: customer._id,
          customerName: customer.name,
          ledgerBalance: customer.lastBalance,
          lastTransactionDate: formattedLastTransactionDate,
          lastInvoiceDate: formattedLastInvoiceDate,
          daysSinceLastPayment: daysSinceLastTransaction
            ? `${daysSinceLastTransaction} days`
            : 'No payment history',
          rawLastTransactionDate: lastTransactionDate,
          rawLastInvoiceDate: lastInvoice?.createdAt || null,
          lastInvoiceTimestamp: lastInvoice?.createdAt || new Date(0) // For sorting
        };
      }
      return null;
    })
  );

  // Filter out null values and sort by last invoice date (most recent first)
  const filteredCustomers = customersWithDetails
    .filter(customer => customer !== null)
    .sort((a, b) => b.lastInvoiceTimestamp - a.lastInvoiceTimestamp);

  console.log(`Returning ${filteredCustomers.length} inactive customers`);

  res.status(200).json({
    status: 'success',
    results: filteredCustomers.length,
    data: {
      customers: filteredCustomers.map(customer => {
        const { lastInvoiceTimestamp, ...customerData } = customer;
        return customerData;
      })
    }
  });
});

exports.getCustomerDetails = catchAsync(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findById(customerId);

  if (!customer) {
    return res.status(404).json({
      status: 'fail',
      message: 'Customer not found'
    });
  }

  const lastTransaction = await Transaction.findOne({
    customerId: customer._id
  }).sort({ paymentDate: -1 });

  const lastTransactionDate = lastTransaction ? lastTransaction.paymentDate : null;
  
  // Calculate days since last transaction
  const daysSinceLastTransaction = lastTransactionDate 
    ? Math.floor((new Date() - new Date(lastTransactionDate)) / (1000 * 60 * 60 * 24))
    : null;

  

  // Get the last invoice date
  const lastInvoice = await Invoice.findOne({ customer: customerId })
    .sort({ date: -1 })
    .limit(1);

  const lastInvoiceDate = lastInvoice ? lastInvoice.date : null;

  // Format dates
  const formattedLastPaymentDate = lastTransactionDate
    ? new Date(lastTransactionDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      })
    : 'No payment history';

  const formattedLastInvoiceDate = lastInvoiceDate
    ? new Date(lastInvoiceDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      })
    : 'No invoices';

  // Construct customer object with only requested fields
  const customerDetails = {
    customerName: customer.name,
    ledgerBalance: customer.lastBalance,
    lastPaymentDate: formattedLastPaymentDate,
    daysSinceLastPayment: daysSinceLastTransaction
      ? `${daysSinceLastTransaction} days`
      : 'No payment history',
    lastInvoiceDate: formattedLastInvoiceDate
  };

  res.status(200).json({
    status: 'success',
    results: 1,
    data: {
      customers: [customerDetails]
    }
  });
});


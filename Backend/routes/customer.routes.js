// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const invoiceController = require('../controllers/invoice.controller');
const authController = require('../controllers/auth.controller');

router.use(authController.protect)
// Route to add a new customer
router.post('/customers', customerController.addCustomer);
router.get('/customers',customerController.getAllCustomers);

// Route to add an invoice to an existing customer
router.post('/customers/:customerId' ,invoiceController.addInvoice);
router.post('/customers/addInvoice/:customerId' ,invoiceController.addInvoiceAndUpdateInventory);
router.put('/customers/updateInvoice/:invoiceId', invoiceController.updateInvoiceAndAdjustInventory);
router.post('/make-payment/:customerId',customerController.makePayment);
router.get('/view-transactions/:customerId',customerController.viewTransactions);
router.get('/getTodaysInvoices',customerController.getTodaysInvoices);
router.get('/getInvoicesByDate',invoiceController.getInvoicesBydate);
router.get('/getTotalledger',customerController.getTotalLedger);
router.get('/customers/:customerId/ledger', customerController.getCustomerLedger);
router.post('/customer/getInvoicesOfCustomer',customerController.getInvoicesOfCustomer);
router.get('/customers/inactive-high-balance', customerController.getInactiveHighBalanceCustomers);
router.get('/customers/:customerId', customerController.getCustomerDetails);


router.get('/getTodaysTrans', customerController.getTodaysTrans);
router.get('/getInvoices', customerController.getInvoices);
router.get('/getYesterdayTrans', customerController.getYesterdayTrans);
router.get('/getYesterdayInvoices',customerController.getYesterdayInvoices);
router.delete('/customers/:customerId/invoices/:invoiceId', invoiceController.deleteInvoice);


module.exports = router;

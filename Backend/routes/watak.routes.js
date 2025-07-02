// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const watakController = require('../controllers/watak.controller');
const authController = require('../controllers/auth.controller');

router.use(authController.protect)


// Route to add an watak to an existing customer
router.post('/vendor/:vendorId' ,watakController.addWatak);
router.put('/vendor/updateWatak/:watakId' ,watakController.updateWatak);
router.post('/make-watak-payment/:vendorId',watakController.watakPayment);

router.delete('/vendor/:vendorId/watak/:watakId', watakController.deleteWatak);
router.get('/getTodaysWataks',watakController.getTodaysWataks);

router.get('/vendors/:vendorId/ledger', watakController.getVendorLedger);
router.get('/getTodaysVendorTrans', watakController.getTodaysVendorTrans);
router.get('/getYesterdayVendorTrans', watakController.getYesterdayVendorTrans);
router.get('/getWataksByDate',watakController.getWataksBydate);



module.exports = router;

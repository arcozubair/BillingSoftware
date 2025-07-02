const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require('../controllers/auth.controller');
const customerController = require('../controllers/customer.controller');


router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);

router.use(authController.protect)

router.get("/getInvoiceNumber",userController.getInvoiceNumber)
router.get("/getWatakNumber",userController.getWatakNumber)

router.put("/updateInvoiceNumber",userController.updateInvoiceNumber);
router.put("/updateWatakNumber",userController.updateWatakNumber);

router.post("/vegetables/addVeg",userController.addveg);
router.get("/vegetables/getVeg",userController.getveg)
router.delete("/deleteCustomer/:customerId",authController.checkSuperAdmin,customerController.deleteCustomer)
router.get("/getCustomers",authController.checkSuperAdmin,customerController.getCustomers)

router.put("/updateCustomer/:customerId", authController.protect, authController.checkSuperAdmin, customerController.updateCustomer);



module.exports = router;

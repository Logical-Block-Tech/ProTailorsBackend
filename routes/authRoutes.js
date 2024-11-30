const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../controllers/authController');
const { createCustomer } = require('../controllers/createCustomerController');
const { fetchCustomer } = require('../controllers/searchCustomer');
const { createOrder } = require('../controllers/createOrder');
const { fetchCustomerData } = require('../controllers/orderList');
const { updateOrder } = require('../controllers/updateOrder');
const { getBoutiqueDetails } = require('../controllers/config');

console.log("authroutes");

router.post('/login', authenticateUser);
router.post('/createCustomer', createCustomer);
router.post('/searchCustomer', fetchCustomer);
router.post('/createOrder', createOrder);
router.post('/orderList', fetchCustomerData);
router.post('/getBoutiqueDetails', getBoutiqueDetails);


module.exports = router;

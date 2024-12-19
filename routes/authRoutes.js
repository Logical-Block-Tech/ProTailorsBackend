const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../controllers/authController');
const { createCustomer } = require('../controllers/createCustomerController');
const { fetchCustomer } = require('../controllers/searchCustomer');
const { createOrder } = require('../controllers/createOrder');
const { fetchCustomerData } = require('../controllers/orderList');
const { updateOrder } = require('../controllers/updateOrder');
const { getBoutiqueDetails } = require('../controllers/config');
const { getOrderDetails } = require('../controllers/searchOrder');


console.log("authroutes");

router.post('/login', authenticateUser);
router.post('/createCustomer', createCustomer);
router.post('/searchCustomer', fetchCustomer);
router.post('/createOrder', createOrder);
router.post('/orderList', fetchCustomerData);
router.post('/updateOrder', updateOrder);
router.post('/getBoutiqueDetails', getBoutiqueDetails);
router.post('/getOrderDetails', getOrderDetails);


module.exports = router;

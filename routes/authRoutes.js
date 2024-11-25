const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../controllers/authController');
const { createCustomer } = require('../controllers/createCustomerController');
const { fetchCustomer } = require('../controllers/searchCustomer');

console.log("authroutes");

router.post('/login', authenticateUser);
router.post('/createCustomer', createCustomer);
router.post('/searchCustomer', fetchCustomer);


module.exports = router;

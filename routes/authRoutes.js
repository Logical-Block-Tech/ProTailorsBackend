const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../controllers/authController');
// const { handleInvestorsAPI } = require('../controllers/InvestorsController');
console.log("authroutes");

router.post('/login', authenticateUser);
//router.post('/investordetails', handleInvestorsAPI);

module.exports = router;

const pool = require('../config/db');

const createCustomer = async (req, res) => {
  const { userName, customerEmail, customermobileNo, boutiqueId, customerName, deviceType } = req.body;
  try {
    let response = { status: '', message: '', errorMessage: null, customer: {} };

    // User check: Verifying user existence
    const [userRows] = await pool.query('SELECT * FROM users WHERE username = ?', [userName]);
    console.log("username", userName);
    if (userRows.length === 0) {
      response.errorMessage = 'USERNAME_NOT_FOUND';
      console.log("User check failed: USERNAME_NOT_FOUND", response.errorMessage);
      res.json(response);
      return;
    }
    const userId = userRows[0].id;

    // Boutique ID check: Validating boutique existence
    const [boutiqueRows] = await pool.query('SELECT * FROM boutiques WHERE id = ?', [boutiqueId]);
    if (boutiqueRows.length === 0) {
      response.errorMessage = 'INVALID_BOUTIQUE_ID';
      console.log("Boutique ID check failed: INVALID_BOUTIQUE_ID", response.errorMessage);
      res.json(response);
      return;
    }

    // Insert new customer
    const [result] = await pool.query(
      'INSERT INTO customers (customer_name, email, mobile_no, device_type, boutique_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [customerName, customerEmail, customermobileNo, deviceType, boutiqueId, userId]
    );

    const customerId = result.insertId;  // Get the newly created customer ID

    response.status = 200;
    response.message = 'Customer created successfully';
    response.customer = { customer_id: customerId, customer_name: customerName, email: customerEmail, mobile_no: customermobileNo, boutique_id: boutiqueId, user_id: userId };

    console.log("Customer creation successful:", response.message);
    res.json(response);
  } catch (err) {
    console.log("Error occurred during customer creation:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { createCustomer };

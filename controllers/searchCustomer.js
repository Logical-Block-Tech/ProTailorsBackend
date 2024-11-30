const pool = require('../config/db');

const fetchCustomer = async (req, res) => {
  const { customerName, customerMobileNo, boutiqueId } = req.body;
  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        customers: [],
      },
    };

    // Validation: Ensure at least one parameter with minimum 4 characters is provided
    if ((!customerName || customerName.length < 4) && (!customerMobileNo || customerMobileNo.length < 4)) {
      response.data.errorMessage = 'MISSING_OR_INVALID_PARAMETERS';
      console.log("Validation failed: MISSING_OR_INVALID_PARAMETERS", response.data.errorMessage);
      res.json(response);
      return;
    }

    // Build the dynamic query based on provided parameters (either name or mobile)
    let query = 'SELECT * FROM customers WHERE boutique_id = ?';
    let params = [boutiqueId];

    if (customerName && customerName.length >= 4) {
      query += ' AND customer_name LIKE ?';
      params.push(`%${customerName}%`); // Partial match for customer name
    }

    if (customerMobileNo && customerMobileNo.length >= 4) {
      query += ' AND mobile_no LIKE ?';
      params.push(`%${customerMobileNo}%`); // Partial match for mobile number
    }

    const [customerRows] = await pool.query(query, params);

    if (customerRows.length === 0) {
      response.data.errorMessage = 'CUSTOMERS_NOT_FOUND';
      console.log("Customer fetch failed: CUSTOMERS_NOT_FOUND", response.data.errorMessage);
      res.json(response);
      return;
    }

    // Return the list of customers matching the search criteria
    response.status = 200;
    response.data.message = 'Customers fetched successfully';
    response.data.customers = customerRows.map(customer => ({
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      email: customer.email,
      mobile_no: customer.mobile_no,
      boutique_id: customer.boutique_id,
      user_id: customer.user_id
    }));

    console.log("Customer fetch successful:", response.data.message);
    res.json(response);
  } catch (err) {
    console.log("Error occurred during customer fetch:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { fetchCustomer };

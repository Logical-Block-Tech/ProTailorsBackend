const pool = require('../config/db');

const getOrderDetails = async (req, res) => {
  const { boutiqueId, orderId } = req.body;

  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        orderDetails: {},
      },
    };

    // Fetch the customer_id from orders table based on boutique_id and order_id
    const [orderRows] = await pool.query(
      'SELECT * FROM orders WHERE boutique_id = ? AND id = ?',
      [boutiqueId, orderId]
    );

    if (orderRows.length === 0) {
      response.data.errorMessage = 'ORDER_NOT_FOUND';
      console.log("Order not found:", response.data.errorMessage);
      res.json(response);
      return;
    }

    const order = orderRows[0];
    const customerId = order.customer_id;

    // Fetch customer details from customers table based on customer_id and boutique_id
    const [customerRows] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND boutique_id = ?',
      [customerId, boutiqueId]
    );

    if (customerRows.length === 0) {
      response.data.errorMessage = 'CUSTOMER_NOT_FOUND';
      console.log("Customer not found:", response.data.errorMessage);
      res.json(response);
      return;
    }

    const customer = customerRows[0];

    // Prepare the full order details including customer data
    response.status = 200;
    response.data.message = 'Order details fetched successfully';
    response.data.orderDetails = {
      ...order,  // Include all columns from the orders table
      customer: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        // Add other customer fields as needed
      }
    };

    console.log("Order details fetched successfully:", response.data.message);
    res.json(response);

  } catch (err) {
    console.log("Error occurred during fetching order details:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { getOrderDetails };

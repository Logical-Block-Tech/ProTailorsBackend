const pool = require('../config/db');

const fetchCustomerData = async (req, res) => {
  const { boutiqueId } = req.body; 
  console.log("API hit", boutiqueId);

  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        customers_statusSorted: {
          new: [],
          ongoing: [],
          delivered: [],
          done: [],
          urgent: [],
        },
        customers_orderSorted: [], // New property to store customers sorted by no_of_orders
      },
    };

    // Fetch all customers for the given boutiqueId
    const [customerRows] = await pool.query('SELECT * FROM customers WHERE boutique_id = ?', [boutiqueId]);
    if (customerRows.length === 0) {
      response.data.errorMessage = 'NO_CUSTOMERS_FOUND_FOR_BOUTIQUE';
      console.log("No customers found for boutique", boutiqueId);
      return res.json(response);
    }

    const allCustomers = []; // Temporary array to store all customers with their details

    // Iterate through each customer and fetch associated data from orders and users
    for (const customer of customerRows) {
      const customerId = customer.id;
      const userId = customer.user_id;

      // Fetch user details for username based on user_id
      const [userRows] = await pool.query('SELECT username FROM users WHERE id = ?', [userId]);
      const username = userRows.length > 0 ? userRows[0].username : 'Unknown';

      // Fetch order details for the current customer
      const [orderRows] = await pool.query(
        'SELECT o.id, o.measurements, o.gstNo, o.orderBillAmount, o.attached_image_1, o.attached_image_2, o.attached_image_3, o.order_date, o.status, o.dress_type_id, d.dress_name ' +
        'FROM orders o JOIN dress_types d ON o.dress_type_id = d.id ' +
        'WHERE o.customer_id = ?',
        [customerId]
      );

      const customerData = {
        customer_id: customerId,
        customer_name: customer.customer_name,
        email: customer.email,
        mobile_no: customer.mobile_no,
        device_type: customer.device_type,
        username: username,
        no_of_orders: orderRows.length,
        orders: [],
      };

      // Process each order for the customer
      for (const order of orderRows) {
        const orderData = {
          order_id: order.id,  
          measurements: order.measurements,
          gstNo: order.gstNo,
          orderBillAmount: order.orderBillAmount,
          attached_image_1: order.attached_image_1,
          attached_image_2: order.attached_image_2,
          attached_image_3: order.attached_image_3,
          order_date: order.order_date,
          status: order.status,
          dress_name: order.dress_name,
        };

        // Add order data to customer orders
        customerData.orders.push(orderData);

        // Add customer to the appropriate status list based on order status
        if (order.status === 'new') {
          if (!response.data.customers_statusSorted.new.some(c => c.customer_id === customerData.customer_id)) {
            response.data.customers_statusSorted.new.push(customerData);
          }
        } else if (order.status === 'ongoing') {
          if (!response.data.customers_statusSorted.ongoing.some(c => c.customer_id === customerData.customer_id)) {
            response.data.customers_statusSorted.ongoing.push(customerData);
          }
        } else if (order.status === 'delivered') {
          if (!response.data.customers_statusSorted.delivered.some(c => c.customer_id === customerData.customer_id)) {
            response.data.customers_statusSorted.delivered.push(customerData);
          }
        } else if (order.status === 'done') {
          if (!response.data.customers_statusSorted.done.some(c => c.customer_id === customerData.customer_id)) {
            response.data.customers_statusSorted.done.push(customerData);
          }
        } else if (order.status === 'urgent') {
          if (!response.data.customers_statusSorted.urgent.some(c => c.customer_id === customerData.customer_id)) {
            response.data.customers_statusSorted.urgent.push(customerData);
          }
        }
      }

      // Add the customer to the temporary array
      allCustomers.push(customerData);
    }

    // Sort customers based on the number of orders in descending order
    response.data.customers_orderSorted = allCustomers.sort((a, b) => b.no_of_orders - a.no_of_orders);

    response.status = 200;
    response.data.message = 'Customer data fetched successfully';
    console.log("Customer data fetched successfully for boutique:", boutiqueId);
    res.json(response);
  } catch (err) {
    console.log("Error occurred while fetching customer data:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { fetchCustomerData };

const pool = require('../config/db');

const createOrder = async (req, res) => {
  const { customerId, boutiqueId, dressType, measurementsDetail, gstNo, orderBillAmount, attachedImages } = req.body;

  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        order: {},
      },
    };

    // Customer and Boutique check: Verifying customer and boutique match
    const [customerRows] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND boutique_id = ?',
      [customerId, boutiqueId]
    );

    if (customerRows.length === 0) {
      response.data.errorMessage = 'INVALID_CUSTOMER_OR_BOUTIQUE';
      console.log("Customer and Boutique check failed: INVALID_CUSTOMER_OR_BOUTIQUE", response.data.errorMessage);
      res.json(response);
      return;
    }

    // If the customer and boutique match, proceed with the order creation
    const customer = customerRows[0];
    const fetchedBoutiqueId = customer.boutique_id;

    // Dress Type check: Verifying if dress type exists or needs to be inserted
    let dressTypeId;
    const [dressTypeRows] = await pool.query('SELECT * FROM dress_types WHERE dress_name = ?', [dressType]);

    if (dressTypeRows.length === 0) {
      const [result] = await pool.query('INSERT INTO dress_types (dress_name) VALUES (?)', [dressType]);
      dressTypeId = result.insertId;
      console.log("New dress type inserted:", dressType);
    } else {
      dressTypeId = dressTypeRows[0].id;
      console.log("Dress type found:", dressTypeRows[0].dress_name);
    }

    // Prepare binary image data
    let attachedImage1 = attachedImages[0] || null;
    let attachedImage2 = attachedImages[1] || null;
    let attachedImage3 = attachedImages[2] || null;

    // Insert order into orders table with images
    const [orderResult] = await pool.query(
      'INSERT INTO orders (customer_id, dress_type_id, boutique_id, measurements, gstNo, orderBillAmount, attached_image_1, attached_image_2, attached_image_3, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customerId, dressTypeId, fetchedBoutiqueId, measurementsDetail, gstNo || null, orderBillAmount, attachedImage1, attachedImage2, attachedImage3, new Date()]
    );

    const orderId = orderResult.insertId;

    response.status = 200;
    response.data.message = 'Order created successfully';
    response.data.order = {
      order_id: orderId,
      customer_id: customerId,
      dress_type_id: dressTypeId,
      boutique_id: fetchedBoutiqueId,
      measurements: measurementsDetail,
      gstNo,
      orderBillAmount,
      attachedImages: [attachedImage1, attachedImage2, attachedImage3],
    };

    console.log("Order creation successful:", response.data.message);
    res.json(response);
  } catch (err) {
    console.log("Error occurred during order creation:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { createOrder };

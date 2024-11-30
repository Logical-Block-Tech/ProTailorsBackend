const pool = require('../config/db');

const updateOrder = async (req, res) => {
  const { orderId, customerId, dressType, measurementsDetail, gstNo, orderBillAmount, attachedImages } = req.body;

  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        updatedFields: {},
      },
    };

    // Check if the order exists
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (orderRows.length === 0) {
      response.data.errorMessage = 'ORDER_NOT_FOUND';
      console.log("Order not found:", response.data.errorMessage);
      res.json(response);
      return;
    }

    // Get existing order details
    const existingOrder = orderRows[0];
    const { customer_id, boutique_id, dress_type_id, measurements, gstNo: existingGstNo, orderBillAmount: existingOrderBillAmount, attached_image_1, attached_image_2, attached_image_3 } = existingOrder;

    // Validate customerId from payload matches the one in the order
    if (customerId !== customer_id) {
      response.data.errorMessage = 'CUSTOMER_ID_MISMATCH';
      console.log("Customer ID mismatch:", response.data.errorMessage);
      res.json(response);
      return;
    }

    // Initialize an object to track updated fields
    const updatedFields = {};

    // Check if a new dress type is provided and update it
    let dressTypeId = dress_type_id;
    if (dressType) {
      const [dressTypeRows] = await pool.query('SELECT * FROM dress_types WHERE dress_name = ?', [dressType]);
      if (dressTypeRows.length === 0) {
        const [result] = await pool.query('INSERT INTO dress_types (dress_name) VALUES (?)', [dressType]);
        dressTypeId = result.insertId;
        updatedFields.dressType = dressType;
        console.log("New dress type inserted:", dressType);
      } else {
        dressTypeId = dressTypeRows[0].id;
        updatedFields.dressType = dressTypeRows[0].dress_name;
        console.log("Dress type found:", dressTypeRows[0].dress_name);
      }
    }

    // Prepare image data and other fields to update
    const attachedImage1 = attachedImages && attachedImages[0] ? attachedImages[0] : attached_image_1;
    const attachedImage2 = attachedImages && attachedImages[1] ? attachedImages[1] : attached_image_2;
    const attachedImage3 = attachedImages && attachedImages[2] ? attachedImages[2] : attached_image_3;

    if (attachedImage1 !== attached_image_1) updatedFields.attached_image_1 = attachedImage1;
    if (attachedImage2 !== attached_image_2) updatedFields.attached_image_2 = attachedImage2;
    if (attachedImage3 !== attached_image_3) updatedFields.attached_image_3 = attachedImage3;

    if (measurementsDetail !== measurements) updatedFields.measurements = measurementsDetail;
    if (gstNo !== existingGstNo) updatedFields.gstNo = gstNo;
    if (orderBillAmount !== existingOrderBillAmount) updatedFields.orderBillAmount = orderBillAmount;

    // Update the order in the database
    await pool.query(
      'UPDATE orders SET dress_type_id = ?, measurements = ?, gstNo = ?, orderBillAmount = ?, attached_image_1 = ?, attached_image_2 = ?, attached_image_3 = ? WHERE id = ?',
      [dressTypeId, measurementsDetail || existingOrder.measurements, gstNo || existingOrder.gstNo, orderBillAmount || existingOrder.orderBillAmount, attachedImage1, attachedImage2, attachedImage3, orderId]
    );

    // Return the updated fields only
    response.status = 200;
    response.data.message = 'Order updated successfully';
    response.data.updatedFields = updatedFields;

    console.log("Order update successful:", response.data.message);
    res.json(response);
  } catch (err) {
    console.log("Error occurred during order update:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { updateOrder };

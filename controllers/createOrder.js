const pool = require('../config/db');
const pdf = require('html-pdf');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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

    console.log("Step 1: Validating Customer and Boutique");
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

    console.log("Step 2: Customer and Boutique validated successfully");
    const customer = customerRows[0];
    const fetchedBoutiqueId = customer.boutique_id;

    console.log("Step 3: Validating Dress Type");
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

    console.log("Step 4: Preparing image data");
    let attachedImage1 = attachedImages[0] || null;
    let attachedImage2 = attachedImages[1] || null;
    let attachedImage3 = attachedImages[2] || null;

    console.log("Step 5: Inserting order into the database");
    const [orderResult] = await pool.query(
      'INSERT INTO orders (customer_id, dress_type_id, boutique_id, measurements, gstNo, orderBillAmount, attached_image_1, attached_image_2, attached_image_3, order_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [customerId, dressTypeId, fetchedBoutiqueId, measurementsDetail, gstNo || null, orderBillAmount, attachedImage1, attachedImage2, attachedImage3, new Date()]
    );

    const orderId = orderResult.insertId;
    console.log("Order inserted into database with ID:", orderId);

    console.log("Step 6: Fetching boutique data");
    const [boutiqueRows] = await pool.query('SELECT * FROM boutiques WHERE id = ?', [boutiqueId]);
    const boutique = boutiqueRows[0];

    if (!boutique) {
      response.data.errorMessage = 'BOUTIQUE_NOT_FOUND';
      console.log("Validation failed: BOUTIQUE_NOT_FOUND", response.data.errorMessage);
      res.json(response);
      return;
    }

    console.log("Step 7: Converting images to JPG");
    const imagePaths = await Promise.all([attachedImage1, attachedImage2, attachedImage3].map(async (imageData, index) => {
      console.log("imageData", imageData);
      if (imageData) {
        const imageBuffer = Buffer.from(imageData, 'base64');
        const imagePath = path.join(__dirname, `../uploads/attached_image_${index + 1}.jpg`);
        await sharp(imageBuffer).jpeg().toFile(imagePath);
        console.log(`Image ${index + 1} converted to JPG at ${imagePath}`);
        return imagePath;
      }
      console.log(`Image ${index + 1} is null, skipping...`);
      return null;
    }));
    console.log("Success");
    const validImagePaths = imagePaths.filter(imagePath => imagePath !== null);

    console.log("Step 8: Preparing HTML content for receipt");
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; }
            .header img { width: 100px; height: 100px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            .footer { margin-top: 20px; text-align: center; }
            .footer p { font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${boutique.logo || ''}" alt="Boutique Logo" />
            <h2>${boutique.name}</h2>
            <p>${boutique.address}</p>
          </div>
          <h3>Order Receipt</h3>
          <table class="table">
            <tr><th>Customer Name</th><td>${customer.customer_name}</td></tr>
            <tr><th>Dress Type</th><td>${dressType}</td></tr>
            <tr><th>Measurements</th><td>${measurementsDetail}</td></tr>
            <tr><th>GST Number</th><td>${gstNo || 'N/A'}</td></tr>
            <tr><th>Order Bill Amount</th><td>${orderBillAmount}</td></tr>
            <tr><th>Order Date</th><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
          <h4>Attached Images</h4>
          <div class="images">
            ${validImagePaths.map(imagePath => `<img src="file://${imagePath}" alt="Image" style="width: 200px; height: auto; margin-right: 10px;" />`).join('')}
          </div>
          <div class="footer">
            <p>Terms and Conditions:</p>
            <p>${boutique.tnc || 'No terms and conditions available.'}</p>
          </div>
        </body>
      </html>
    `;

    const puppeteer = require('puppeteer');

    console.log("Step 9: Generating PDF");
    const assetsFolderPath = path.join(__dirname, '../assets');

    if (!fs.existsSync(assetsFolderPath)) {
      fs.mkdirSync(assetsFolderPath, { recursive: true });
    }

    (async () => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
          waitUntil: 'load',
        });

        const pdfPath = path.join(assetsFolderPath, `order_${orderId}_receipt.pdf`);
        await page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true,
        });

        await browser.close();

        console.log("Step 10: PDF generated successfully");
        response.status = 200;
        response.data.message = 'Order created successfully, receipt generated';
        response.data.order = {
          order_id: orderId,
          customer_id: customerId,
          dress_type_id: dressTypeId,
          boutique_id: fetchedBoutiqueId,
          measurements: measurementsDetail,
          gstNo,
          orderBillAmount,
          attachedImages: validImagePaths,
          receiptUrl: pdfPath,
        };

        console.log("Order created successfully, PDF receipt generated:", response.data.message);
        res.json(response);
      } catch (err) {
        console.log('Error generating PDF with Puppeteer:', err);
        res.status(500).json({ errorMessage: 'Failed to generate receipt PDF' });
      }
    })();
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ errorMessage: 'Failed to create order' });
  }
};

module.exports = { createOrder };

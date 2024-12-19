const pool = require('../config/db');

const getBoutiqueDetails = async (req, res) => {
  const { boutiqueId ,username} = req.body;

  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        boutique: {},
      },
    };

    // Check if the boutique exists
    const [boutiqueRows] = await pool.query('SELECT * FROM boutiques WHERE id = ? AND username = ?', [boutiqueId, username]);

    if (boutiqueRows.length === 0) {
      response.data.errorMessage = 'BOUTIQUE_NOT_FOUND';
      console.log("Boutique not found:", response.data.errorMessage);
      res.json(response);
      return;
    }

    // Get boutique details
    const boutiqueDetails = boutiqueRows[0];

    // Return the boutique details
    response.status = 200;
    response.data.message = 'Boutique details fetched successfully';
    response.data.boutique = boutiqueDetails;

    console.log("Boutique details fetched successfully:", response.data.message);
    res.json(response);
  } catch (err) {
    console.log("Error occurred during fetching boutique details:", err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { getBoutiqueDetails };

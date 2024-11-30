const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { encrypt256 } = require('../utils/encrypt');
const axios = require('axios');

const authenticateUser = async (req, res) => {
  const { username, password, deviceType } = req.body;
  try {
    let response = {
      status: '',
      data: {
        message: '',
        errorMessage: null,
        userName: 'NOT_AVAILABLE',
        Authentication: 'NOT_DONE',
        LocationAccess: 'NOT_VALID',
      },
    };

    // User check: Retrieving user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const userNamefromdb = rows[0]?.username || '';
    console.log('User check: Retrieving user from the database', userNamefromdb);
    if (rows.length === 0) {
      response.data.errorMessage = 'USER_DOESNT_EXIST';
      console.log('User check failed: USER_DOESNT_EXIST', response.data.errorMessage);
      res.json(response);
      return;
    } else {
      response.data.userName = userNamefromdb;
    }

    // Password check: Verifying user password
    const user = rows[0];
    const encryptedPassword = encrypt256(password);
    const validPassword = encryptedPassword.encryptedData === user.password;
    if (!validPassword) {
      response.data.errorMessage = 'INVALID_PASSWORD';
      console.log('Password check failed: INVALID_PASSWORD', response.data.errorMessage);
      res.json(response);
      return;
    } else {
      console.log('Password check successful: Valid password');
      response.data.Authentication = 'DONE';
    }

    // Device type check: Validating device type
    const [deviceRows] = await pool.query('SELECT * FROM device_types WHERE device_type = ?', [deviceType]);
    if (deviceRows.length === 0) {
      response.data.errorMessage = 'INVALID_DEVICE_TYPE';
      console.log('Device type check failed: INVALID_DEVICE_TYPE', response.data.errorMessage);
      res.json(response);
      return;
    } else {
      console.log('Device type check successful: Valid device type');
    }

    if (!response.data.errorMessage && response.data.Authentication === 'DONE' && rows.length !== 0) {
      response.status = 200;
    } else {
      response.status = 'ERROR';
    }

    // Generating JWT token
    if (!response.data.errorMessage) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      response.data.token = token;
    }

    res.json(response);
  } catch (err) {
    console.log('Error occurred during authentication:', err.message);
    res.status(500).json({ errorMessage: err.message });
  }
};

module.exports = { authenticateUser };

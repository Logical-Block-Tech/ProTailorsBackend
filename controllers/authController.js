const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { encrypt256, decrypt256 } = require('../utils/encrypt');
const axios = require('axios');

const authenticateUser = async (req, res) => {
  const { username, password, deviceType } = req.body;
  try {
    let response = { status:'', message: '', errorMessage:null, userName: 'NOT_AVAILABLE', Authentication:'NOT_DONE',LocationAccess:'NOT_VALID' };

    // User check: Retrieving user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const userNamefromdb = rows[0]?.username || '';
    console.log("User check: Retrieving user from the database", userNamefromdb);
    if (rows.length === 0) {
      response.errorMessage = 'USER_DOESNT_EXIST';
      console.log("User check failed: USER_DOESNT_EXIST", response.errorMessage);
      res.json(response.errorMessage);
      return; 
    } else {
      response.userName = userNamefromdb;
    }
    
    // Password check: Verifying user password

    const user = rows[0];
    // const encryptedPassword = {
    //   iv: Buffer.alloc(16).toString('base64'), 
    //   encryptedData: 'Jqyr01e1voQTLYfEgF9ScA=='
    // };    
    const encryptedPassword = encrypt256(password);
    //console.log("meow", decryptedPassword);
    const validPassword = (encryptedPassword.encryptedData === user.password);
    if (!validPassword) {
      response.errorMessage = 'INVALID_PASSWORD';
      console.log("Password check failed: INVALID_PASSWORD", response.errorMessage);
      res.json(response);
      return; 
    }else {
      console.log("Password check successful: Valid password");
      response.Authentication = 'DONE';
    }

    // Device type check: Validating device type
    const [deviceRows] = await pool.query('SELECT * FROM device_types WHERE device_type = ?', [deviceType]);
    if (deviceRows.length === 0) {
      response.errorMessage = 'INVALID_DEVICE_TYPE';
      console.log("Device type check failed: INVALID_DEVICE_TYPE", response.errorMessage);
      res.json(response);
      return;
    } else {
      console.log("Device type check successful: Valid device type");
    }

    if (!response.errorMessage && response.Authentication === 'DONE' && rows.length !== 0) {
      response.status = 200;
    } else {
      response.status = 'ERROR';
    }

        // Step 5: Generating JWT token
        if (!response.errorMessage) {
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
          response.token = token;
        }

    res.json(response);
  } catch (err) {
    console.log("Error occurred during authentication:", err.errorMessage);
    res.status(500).json({ errorMessage: err.errorMessage });
  }
};

module.exports = { authenticateUser };

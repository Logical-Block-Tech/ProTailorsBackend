const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  console.log("api hit ");
  const token = req.headers['authorization'];


    if (req.path === '/api/login') {
      return next();
    }
    
  console.log("token",token);
  const tokenString = token.replace('Bearer ', '').trim();
  console.log("token",tokenString);
  jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(200).json({ success: false, message: 'TOKEN_EXPIRED_OR_INVALID', error: err.message });
    }
    req.userId = decoded.id;
    next();
  });  
}

module.exports = verifyToken;

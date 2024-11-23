const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middlewares/middleware');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
console.log("server.js");
const app = express();
app.use(cors());
app.use(bodyParser.json()); 
app.use(verifyToken);
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


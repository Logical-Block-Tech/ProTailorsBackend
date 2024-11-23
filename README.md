Project Structure


├── config/db.js           # Database connection
├── controllers/authController.js  # Authentication logic
├── middleware/verifyToken.js      # JWT validation
├── routes/authRoutes.js           # API routes
├── utils/encrypt.js               # Encryption utilities
├── server.js                      # Main entry point
└── .env                           # Environment variables
-------------------------------------------------------------------------------------------

Setup -
git clone <repo_url>
cd <project_directory>
npm install

create .env - 
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=auth_db
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

start server - 
node server.js
-------------------------------------------------------------------------------------------
Environment Variables -
DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE
JWT_SECRET, ENCRYPTION_KEY

Dependencies - 
express, mysql2/promise, jsonwebtoken, crypto, dotenv.

Note - 
Add .env to .gitignore to keep credentials secure.
-------------------------------------------------------------------------------------------

API Endpoints - 

A. Not Protected - 
1. Login
request - 
POST /api/login
{
  "username": "your_username",
  "password": "your_password"
}
response - JWT token + user details.

B Protected - 
1. GET /protected
Header: Authorization: Bearer <token>
-------------------------------------------------------------------------------------------
Features - 
1. Login API
User login with JWT-based authentication.
AES-256 encryption for sensitive data.

const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();
const tokenKey = process.env.JWT_KEY;

const pool = new Pool({
  host: '203.151.39.86',
  user: 'max',
  port: 5432,
  password: 'm@xDev1DM',
  database: 'vue_test',
});

const protectedRoute = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, tokenKey);
      const client = await pool.connect();

      const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [decoded.username],
      };

      const result = await client.query(query);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      req.user = {
        id: result.rows[0].user_id,
        username: result.rows[0].username,
        password: result.rows[0].password,
      };

      client.release();

      next();
    } catch (error) {
      console.log('Error in jwt.verify():', error);
      res.status(401).json({
        message: 'Not authorized',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { protectedRoute };

const bcrypt = require('bcrypt');
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

pool.connect().then((con) => {
  if (con._connected === true) {
    console.log('Connected database Successsfully');
  }
});

exports.register = async (req, res) => {
  const { username, email, password, transaction_id } = req.body;
  try {
    const data = await pool.query(`SELECT * FROM users WHERE username= $1;`, [
      username,
    ]);

    const arr = data.rows;

    if (arr.length != 0) {
      return res.status(400).json({
        message: 'Username is already exist.',
      });
    } else {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err)
          res.status(err).json({
            message: 'Server error',
          });
        const user = {
          username,
          email,
          password: hash,
          transaction_id,
        };

        pool.query(
          `INSERT INTO users (username, email, password) VALUES ($1,$2,$3);`,
          [user.username, user.email, user.password],
          (err) => {
            if (err) {
              flag = 0;
              console.error(err);
              return res.status(500).json({
                message: 'Database error',
              });
            } else {
              flag = 1;
              res.status(200).send({ message: 'User added to database' });
            }
          }
        );
        pool.query(
          `INSERT INTO transactions(transaction_id, username, email, details, balance)
          VALUES('${user.transaction_id}', '${user.username}', '${user.email}', 'เปิดบัญชี', 0 )
          `
        );
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Database error while registring user!',
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await pool.query(`SELECT * FROM users WHERE email= $1;`, [
      email,
    ]);
    const user = data.rows;

    if (user.length === 0) {
      res.status(400).json({
        message: 'User is not registered',
      });
    } else {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          res.status(500).json({
            message: 'Server error',
          });
        } else if (result === true) {
          const token = jwt.sign(
            {
              username: email,
            },
            tokenKey
          );
          res.status(200).json({
            token: token,
            user: user[0].username,
            email: user[0].email,
          });
        } else {
          if (result != true)
            res.status(400).json({
              message: 'Enter correct password!',
            });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Database error occurred while signing in!',
    });
  }
};

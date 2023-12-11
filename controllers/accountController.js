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

exports.deposit = async (req, res) => {
  const { id, accountName, accountEmail, amount, balance } = req.body;
  try {
    const data = await pool.query(
      `INSERT INTO transactions (transaction_id, username, email, deposit, balance, date)
        VALUES ('${id}', '${accountName}', '${accountEmail}', ${amount}, ${
        Number(balance) + Number(amount)
      }, now())`
    );
    const deposit = data.rows;
    res.send({ data: deposit });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Database error occurred while deposition',
    });
  }
};

exports.transfer = async (req, res) => {
  const { id, accountName, accountEmail, amount, balance, receiver, details } =
    req.body;
  try {
    await pool.query(
      `INSERT INTO transactions (transaction_id,username, email, transfer, balance, date,receiver, details)
                           VALUES ('${id}','${accountName}', '${accountEmail}', ${-amount}, ${
        Number(balance) - Number(amount)
      }, now(), '${receiver}', '${details}')`
    );
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username = '${receiver}' LIMIT 1`
    );
    const receiver_balance = await pool.query(
      `SELECT balance FROM transactions WHERE username = '${receiver}' ORDER BY transaction_id DESC LIMIT 1`
    );
    const result = receiver_balance.rows;
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    if (result.length === 0) {
      const new_first_id = Number(getRandomInt(100)) + Number(id);
      await pool.query(
        `INSERT INTO transactions (transaction_id,username, email, transfer, balance, date, sender)
        VALUES ('${new_first_id}','${receiver}', '${
          rows[0].email
        }', ${amount}, ${Number(0) + Number(amount)}, now(), '${accountName}')`
      );

      res.send({
        data: result,
      });
    } else {
      const new_id = Number(getRandomInt(100)) + Number(id);
      await pool.query(
        `INSERT INTO transactions (transaction_id,username, email, transfer, balance, date, sender)
        VALUES ('${new_id}','${receiver}', '${rows[0].email}', ${amount}, ${
          Number(result[0].balance) + Number(amount)
        }, now(), '${accountName}')`
      );
      res.send({
        data: result,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Database error occurred while transfering!',
    });
  }
};

exports.getData = async (req, res) => {
  const email = req.query.q;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM transactions WHERE email = '${email}' ORDER BY transaction_id `
    );
    const users = await pool.query(`SELECT username FROM users`);
    const users_data = users.rows;
    if (rows.length === 0) {
      const balance = 0;
      res.send({
        data: {
          balance: balance,
        },
      });
    } else {
      const data = rows;
      res.send({
        data: data,
        users: users_data,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Database error occurred while getting data!',
    });
  }
};

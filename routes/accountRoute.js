const express = require('express');
const router = express.Router();
const {
  getData,
  deposit,
  transfer,
} = require('../controllers/accountController');
const { protectedRoute } = require('../middleware/authMiddlware');

router.post('/deposit', protectedRoute, deposit);
router.post('/transfer', protectedRoute, transfer);
router.get('/getData', protectedRoute, getData);

module.exports = router;

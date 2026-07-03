const express = require('express');
const router = express.Router();
const {
  getTransactions, getSummary, getChartData, exportCSV, getFilters,
} = require('../controllers/transactionsController');
const { placeOrder } = require('../controllers/ordersController');

router.get('/transactions', getTransactions);
router.get('/summary', getSummary);
router.get('/charts', getChartData);
router.get('/export', exportCSV);
router.get('/filters', getFilters);
router.post('/orders', placeOrder);

module.exports = router;

const express = require('express');

const walletController = require('./../controllers/walletController');
const authController = require('./../controllers/authController');

const incomeRouter = require('./../routes/incomeRoutes');
const spendingRouter = require('./../routes/spendingRoutes');

const router = express.Router();

// Protecct all the routes after this middleware
router.use(authController.protect);

// Nested routes
router.use('/:walletId/incomes', incomeRouter);
router.use('/:walletId/spendings', spendingRouter);

// Advanced routes
// router.route('/month-incomes/:id').get(walletController.getMonthIncomesWallet);

// Basic routes
router
  .route('/')
  .get(walletController.getAllWallets)
  .post(walletController.createWallet);

router
  .route('/:id')
  .get(walletController.getWallet)
  .patch(walletController.updateWallet)
  .delete(walletController.deleteWallet);

module.exports = router;

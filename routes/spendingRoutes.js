const express = require('express');
const spendingController = require('./../controllers/spendingController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protecct all the routes after this middleware
router.use(authController.protect);

// Advanced routes
router
  .route('/monthly-spending/:year')
  .get(spendingController.getMonthlySpendingStats);

// Basic routes
router
  .route('/')
  .get(spendingController.getAllSpendings)
  .post(spendingController.setWalletId, spendingController.createSpending);

router
  .route('/:id')
  .get(spendingController.getSpending)
  .patch(spendingController.updateSpending)
  .delete(spendingController.deleteSpending);

module.exports = router;

const express = require('express');
const incomeController = require('./../controllers/incomeController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protecct all the routes after this middleware
router.use(authController.protect);

// Advanced routes
router.route('/month-incomes/:month').get(incomeController.getMonthIncomes);
router.route('/year-incomes/:year').get(incomeController.getYearIncomes);

// Basic routes
router
  .route('/')
  .get(incomeController.getAllIncomes)
  .post(incomeController.createIncome);

router
  .route('/:id')
  .get(incomeController.getIncome)
  .patch(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

module.exports = router;

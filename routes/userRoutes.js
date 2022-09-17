const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const incomeRouter = require('./../routes/incomeRoutes');
const spendingRouter = require('./../routes/spendingRoutes');
const catalogueRouter = require('./../routes/catalogueRoutes');

const router = express.Router();

// Advanced routes
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

// Protecct all the routes after this middleware
router.use(authController.protect);

// Nested routes
router.use('/:userId/incomes', incomeRouter);
router.use('/:userId/spendings', spendingRouter);
router.use('/:userId/catalogues', catalogueRouter);

// Need to be authenticated routes
router.patch('/updateMyPassword', authController.updatePassword);

router.get('/user-stats', userController.getUserStats);

// Basic routes
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

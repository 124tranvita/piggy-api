const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Advanced routes
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.use(authController.protect);

// Need to be authenticated routes
router.patch('/updateMyPassword', authController.updatePassword);

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

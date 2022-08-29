const express = require('express');
const authController = require('./../controllers/authController');
const catalogueController = require('./../controllers/catalogueController');

const router = express.Router();

// Protecct all the routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(catalogueController.getAllCatalogues)
  .post(catalogueController.createCatalogue);

router
  .route('/:id')
  .get(catalogueController.getCatalogue)
  .patch(catalogueController.updateCatalogue)
  .delete(catalogueController.deleteCatalogue);

module.exports = router;

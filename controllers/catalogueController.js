const Catalogue = require('./../models/catalogueModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.getAllCatalogues = catchAsync(async (req, res, next) => {
  const catalogues = await Catalogue.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    result: catalogues.length,
    data: {
      data: catalogues
    }
  });
});

exports.createCatalogue = handlerFactory.createOne(Catalogue, true);
exports.getCatalogue = handlerFactory.getOne(Catalogue, {
  path: 'spendings',
  select: 'name amount'
});
exports.updateCatalogue = handlerFactory.updateOne(Catalogue);
exports.deleteCatalogue = handlerFactory.deleteOne(Catalogue);

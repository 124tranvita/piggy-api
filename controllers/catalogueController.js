const Catalogue = require('./../models/catalogueModel');
const Spending = require('./../models/spendingModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/**Use by PiGGY UI - Catalogues component*/
exports.getAllCatalogues = handlerFactory.getAll(Catalogue);

/**Use by PiGGY UI - Catalogues component*/
exports.createCatalogue = handlerFactory.createOne(Catalogue, true);

exports.getCatalogue = handlerFactory.getOne(Catalogue, {
  path: 'spendings',
  select: 'name amount'
});

/**Use by PiGGY UI - Catalogues component*/
exports.updateCatalogue = handlerFactory.updateOne(Catalogue);

/**Use by PiGGY UI - Catalogues component*/
exports.deleteCatalogue = catchAsync(async (req, res, next) => {
  const items = await Spending.find({ catalogue: req.params.id });

  if (items[0]) {
    return next(
      new AppError('Catalogue item have some spendings belong.', 400)
    );
  }

  const doc = await Catalogue.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

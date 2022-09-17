const User = require('./../models/userModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllUsers = (req, res, next) => {};
exports.createUser = handlerFactory.createOne(User);
exports.getUser = handlerFactory.getOne(User, {
  path: 'catalogues',
  select: 'name'
});
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

/** Currently using by PiGGY Dashboard page */
exports.getUserStats = catchAsync(async (req, res, next) => {
  const query = User.findById(req.user.id).select('-name -email -role -__v');

  query.populate({ path: 'catalogues', select: '-__v' });
  query.populate({
    path: 'incomes',
    select: '-__v',
    options: { limit: 15, sort: '-createAt' }
  });
  query.populate({
    path: 'spendings',
    select: '-__v',
    options: { limit: 15, sort: '-createAt' }
  });

  const userStats = await query;

  if (!userStats) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: userStats
    }
  });
});

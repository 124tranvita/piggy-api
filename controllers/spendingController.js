const mongoose = require('mongoose');
const Spending = require('./../models/spendingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

/**Use by PiGGY UI - Spendings component*/
exports.getAllSpendings = handlerFactory.getAll(Spending);
exports.createSpending = handlerFactory.createOne(Spending, true);
exports.updateSpending = handlerFactory.updateOne(Spending);
exports.deleteSpending = handlerFactory.deleteOne(Spending);
exports.getSpendingInPeriod = catchAsync(async (req, res, next) => {
  const { from, to } = req.params;

  // console.log(from, to);

  const incomes = await Spending.find({
    user: req.user.id,
    createAt: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  });

  if (!incomes) {
    return next(new AppError('No document found in that period', 404));
  }

  res.status(200).json({
    status: 'success',
    result: incomes.length,
    data: {
      data: incomes
    }
  });
});

/**NOT use by PiGGY UI*/
exports.getSpending = handlerFactory.getOne(Spending, {
  path: 'catalogue',
  select: 'name'
});

exports.getSpendingByCatalogue = catchAsync(async (req, res, next) => {
  const spendings = await Spending.find({
    catalogue: req.params.id
  });

  if (!spendings) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    results: spendings.length,
    data: spendings
  });
});

exports.getMonthlySpendingStats = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  let filter = {};

  if (req.params.walletId)
    filter = { wallet: mongoose.Types.ObjectId(req.params.walletId) };

  filter.createAt = {
    $gte: new Date(`${year}-01-01`),
    $lte: new Date(`${year}-12-31`)
  };

  const stats = await Spending.aggregate([
    {
      $match: {
        createAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createAt' },
        numSpent: { $sum: 1 },
        sumSpent: { $sum: '$total' },
        avgSpent: { $avg: '$total' },
        minSpent: { $min: '$total' },
        maxSpent: { $max: '$total' }
      }
    },
    {
      $sort: { createAt: 1 }
    },
    {
      $addFields: { month: '$_id' }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

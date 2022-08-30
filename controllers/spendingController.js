const mongoose = require('mongoose');
const Spending = require('./../models/spendingModel');
const catchAsync = require('./../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.getAllSpendings = handlerFactory.getAll(Spending);
exports.getSpending = handlerFactory.getOne(Spending);
exports.createSpending = handlerFactory.createOne(Spending, true);
exports.updateSpending = handlerFactory.updateOne(Spending);
exports.deleteSpending = handlerFactory.deleteOne(Spending);

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

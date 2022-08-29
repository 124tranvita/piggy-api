const mongoose = require('mongoose');
const Income = require('./../models/incomeModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');

exports.setWalletId = (req, res, next) => {
  if (!req.body.wallet) req.body.wallet = req.params.walletId;
  next();
};

exports.getAllIncomes = handlerFactory.getAll(Income);
exports.getIncome = handlerFactory.getOne(Income, { path: 'wallet' });
exports.createIncome = handlerFactory.createOne(Income);
exports.updateIncome = handlerFactory.updateOne(Income);
exports.deleteIncome = handlerFactory.deleteOne(Income);

exports.getMonthIncomes = catchAsync(async (req, res, next) => {
  const month = req.params.month * 1;
  const currentYear = new Date().getFullYear();

  let filter = {};

  if (req.params.walletId)
    filter = { wallet: mongoose.Types.ObjectId(req.params.walletId) };

  filter.createAt = {
    $gte: new Date(`${currentYear}-${month}-01`),
    $lte: new Date(`${currentYear}-${month}-31`)
  };

  // console.log(filter);

  const incomes = await Income.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: { $month: '$createAt' },
        numIncomes: { $sum: 1 },
        sumAmount: { $sum: '$amount' },
        incomes: { $push: { name: '$name', amount: '$amount' } }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: incomes
    }
  });
});

exports.getYearIncomes = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  let filter = {};

  if (req.params.walletId)
    filter = { wallet: mongoose.Types.ObjectId(req.params.walletId) };

  filter.createAt = {
    $gte: new Date(`${year}-01-01`),
    $lte: new Date(`${year}-12-31`)
  };

  const incomes = await Income.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: { $year: '$createAt' },
        numIncomes: { $sum: 1 },
        sumAmount: { $sum: '$amount' },
        incomes: { $push: { name: '$name', amount: '$amount' } }
      }
    },
    {
      $addFields: { year: '$_id' }
    },
    {
      $project: { _id: 0 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: incomes
    }
  });
});

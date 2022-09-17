const mongoose = require('mongoose');
const Income = require('./../models/incomeModel');
const handlerFactory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const AppError = require('./../utils/appError');

/**Use by PiGGY UI - Incones component*/
exports.getAllIncomes = handlerFactory.getAll(Income);
exports.createIncome = handlerFactory.createOne(Income, true);
exports.updateIncome = handlerFactory.updateOne(Income);
exports.deleteIncome = handlerFactory.deleteOne(Income);
exports.getIncomeInPeriod = catchAsync(async (req, res, next) => {
  const { from, to } = req.params;

  const incomes = await Income.find({
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
exports.getIncome = handlerFactory.getOne(Income);
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

// exports.getIncomesByDayInMonth = catchAsync(async (req, res, next) => {
//   const month = req.params.month * 1;
//   const currentYear = new Date().getFullYear();

//   const incomes = await Income.aggregate([
//     {
//       $match: {
//         createAt: {
//           $gte: new Date(`${currentYear}-${month}-01`),
//           $lte: new Date(`${currentYear}-${month}-31`)
//         }
//       }
//     },
//     {
//       $group: {
//         _id: { $dateToString: { format: '%Y-%m-%d', date: '$createAt' } },
//         numIncomes: { $sum: 1 },
//         sumAmount: { $sum: '$amount' }
//       }
//     },
//     {
//       $addFields: { day: '$_id' }
//     },
//     {
//       $project: { _id: 0 }
//     }
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: incomes
//     }
//   });
// });

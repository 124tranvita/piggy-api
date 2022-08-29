const Wallet = require('./../models/walletModel');
const handlerFactory = require('./handlerFactory');
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');

exports.getAllWallets = handlerFactory.getAll(Wallet);
exports.getWallet = handlerFactory.getOne(Wallet, {
  path: 'incomes',
  select: '-__v',
  options: {
    limit: 30 // Limit incomes for the latest 30 days
  }
});
exports.createWallet = handlerFactory.createOne(Wallet, true);
exports.updateWallet = handlerFactory.updateOne(Wallet);
exports.deleteWallet = handlerFactory.deleteOne(Wallet);

const User = require('./../models/userModel');
const handlerFactory = require('./handlerFactory');

exports.getAllUsers = (req, res, next) => {};
exports.createUser = handlerFactory.createOne(User);
exports.getUser = handlerFactory.getOne(User, {
  path: 'catalogues',
  select: 'name'
});
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

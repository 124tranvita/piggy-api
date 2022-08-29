const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wallet mus have name!'],
      unique: true,
      trim: true,
      maxlength: [16, 'Wallet name must have less or equal than 16 characters'],
      minlength: [2, 'Wallet name must have more or equal than 2 characters']
    },
    balance: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Wallet must belong to user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
walletSchema.virtual('incomes', {
  ref: 'Income',
  foreignField: 'wallet',
  localField: '_id'
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;

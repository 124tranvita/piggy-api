const mongoose = require('mongoose');
const Wallet = require('./../models/walletModel');

const incomeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Income must have a name.'],
      maxlength: [32, 'Income name must have less or equal than 32 characters.']
    },
    amount: {
      type: Number,
      default: 0
    },
    createAt: {
      type: Date,
      default: Date.now()
    },
    wallet: {
      type: mongoose.Schema.ObjectId,
      ref: 'Wallet',
      required: [true, 'Income must have wallet to contain.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// STATIC FUNCTIONS
// Calculate sum amount in 30 days period
incomeSchema.statics.calcSumAmount = async function(walletId) {
  const today = new Date();
  const past30Days = new Date(new Date().setDate(new Date().getDate() - 30));

  const stats = await this.aggregate([
    {
      $match: {
        wallet: walletId,
        createAt: {
          $gte: new Date(past30Days),
          $lte: new Date(today)
        }
      }
    },
    {
      $group: {
        _id: '$wallet',
        sumAmount: { $sum: '$amount' }
      }
    }
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Wallet.findByIdAndUpdate(walletId, {
      balance: stats[0].sumAmount
    });
  } else {
    await Wallet.findByIdAndUpdate(walletId, {
      balance: 0
    });
  }
};

// MIDDLEWARE
// Calcalate the sum of amount after income document is created (Document middleware)
incomeSchema.post('save', function() {
  this.constructor.calcSumAmount(this.wallet);
});

// Get the income docuement when it updated or deleted (Query middleware)
// findByIdAndUpdate/findByIdAndDelete
incomeSchema.pre(/^findOneAnd/, async function(next) {
  this.doc = await this.findOne().clone();
  // console.log(this.doc);
  next();
});

// Calcalate the sum of amount after income document is updated or delected (Document middleware)
incomeSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.doc.constructor.calcSumAmount(this.doc.wallet);
});

// Populate middleware
// incomeSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'wallet',
//     select: '-__v -balance'
//   });

//   next();
// });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;

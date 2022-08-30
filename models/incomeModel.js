const mongoose = require('mongoose');
const User = require('./../models/userModel');

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
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Income must belong to specific user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// STATIC FUNCTIONS
// Calculate sum of income in monthly
incomeSchema.statics.calcSumAmount = async function(userId) {
  const currentYear = new Date().getFullYear();
  const currnetMonth = new Date().getMonth() + 1;

  const stats = await this.aggregate([
    {
      $match: {
        user: userId,
        createAt: {
          $gte: new Date(`${currentYear}-${currnetMonth}-01`),
          $lte: new Date(`${currentYear}-${currnetMonth}-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createAt' },
        sumAmount: { $sum: '$amount' }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      income: stats[0].sumAmount
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      income: 0
    });
  }
};

// MIDDLEWARE
// Calcalate the sum of amount after income document is created (Document middleware)
incomeSchema.post('save', function() {
  this.constructor.calcSumAmount(this.user);
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
  await this.doc.constructor.calcSumAmount(this.doc.user);
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;

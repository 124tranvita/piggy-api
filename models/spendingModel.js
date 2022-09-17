const mongoose = require('mongoose');
const User = require('./userModel');

const spendingSchema = new mongoose.Schema({
  name: {
    type: String,
    reuqired: [true, 'Spending must have a name.'],
    maxlength: [
      32,
      'Spending name must have lesser or equal than 32 characters.'
    ],
    minlength: [
      2,
      'Spending name must have greater or equal than 2 characters.'
    ]
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  description: String,
  price: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: function() {
      return this.price * this.quantity;
    }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Spending must belong to specific user.']
  },
  catalogue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Catalogue',
    required: [true, 'Spending must belong to one catalogue.']
  }
});

// STATIC FUNCTIONS
// Calculate sum of income in monthly
spendingSchema.statics.calcSumTotal = async function(userId) {
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
        sumTotal: { $sum: '$total' }
      }
    }
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      spending: stats[0].sumTotal
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      spending: 0
    });
  }
};

// MIDDLEWARE
// Virtual populate
spendingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'catalogue',
    select: 'name'
  });

  next();
});

spendingSchema.pre('save', function(next) {
  this.populate({
    path: 'catalogue',
    select: 'name'
  });

  next();
});

// Calcalate the sum of amount after income document is created (Document middleware)
spendingSchema.post('save', function() {
  this.constructor.calcSumTotal(this.user);
});

// Get the income docuement when it updated or deleted (Query middleware)
// findByIdAndUpdate/findByIdAndDelete
spendingSchema.pre(/^findOneAnd/, async function(next) {
  this.doc = await this.findOne().clone();
  // console.log(this.doc);
  next();
});

// Calcalate the sum of amount after income document is updated or delected (Document middleware)
spendingSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.doc.constructor.calcSumTotal(this.doc.user);
});

const Spending = mongoose.model('Spending', spendingSchema);

module.exports = Spending;

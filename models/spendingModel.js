const mongoose = require('mongoose');

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
  wallet: {
    type: mongoose.Schema.ObjectId,
    ref: 'Wallet',
    required: [true, 'Spending must managed by a wallet.']
  },
  catalogue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Catalogue',
    required: [true, 'Spending must belong to one catalogue.']
  }
});

const Spending = mongoose.model('Spending', spendingSchema);

module.exports = Spending;

const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Catalogue must have a name.'],
      unique: true,
      maxlength: [
        16,
        'Catalogue name must have lesser or equal to 16 characters.'
      ],
      minlength: [
        2,
        'Catalogue name must have lesser or equal to 2 characters.'
      ]
    },
    createAt: {
      type: Date,
      default: Date.now()
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Catalogue item should belong to user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
catalogueSchema.virtual('spendings', {
  ref: 'Spending',
  localField: '_id',
  foreignField: 'catalogue'
});

const Catalogue = mongoose.model('Catalogue', catalogueSchema);

module.exports = Catalogue;

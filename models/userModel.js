const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      maxlength: [
        32,
        'A user name must have less or equal than 32 characters.'
      ],
      minlength: [4, 'A user name must have more or equal than 4 characters.']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.']
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: 'Password are not the same.'
      }
    },
    passwordChangedAt: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
userSchema.virtual('catalogues', {
  ref: 'Catalogue',
  foreignField: 'user',
  localField: '_id'
});

userSchema.virtual('wallets', {
  ref: 'Wallet',
  foreignField: 'user',
  localField: '_id'
});

// MIDDLEWARE
userSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'wallets',
    select: '_id name'
  }).populate({
    path: 'catalogues',
    select: '_id name'
  });

  next();
});

// Encrypted user's password
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined; // this field just for the user confirm, does not need to save to DB

  next();
});

// Get the passwordChangedAt time
userSchema.pre('save', function(next) {
  /**Because sometime, the token was issued before the passwordChangedAt timestamp is created
   * it make the changedPasswordAfter() error and user cannot login after password changed.
   * Solution: Date.now() - 1000; => make the passwordChangedAt is delayed by 1s.
   */
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// INSTANCE METHODS
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * passwordChangeAfter()
 * Function to check if JWT issued timestamp is greater or lesser than passwordChangeAt timestamp
 * If JWT issued timestamp > passwordChangeAt timestamp => Password does NOT change (return false)
 * If JWT issued timestamp < passwordChangeAt timstamp => Password was changed (return true)
 * Return true mean, JWT token was expired as password has been changed, need to send new sign token again
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // getTime() return milisecond but JWTTimestamp is seconnd => / 1000

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

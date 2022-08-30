const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');
const incomeRouter = require('./routes/incomeRoutes');
const catalogueRouter = require('./routes/catalogueRoutes');
const spendingRouter = require('./routes/spendingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) GLOBAL MIDDLEWARE
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(bodyParser.json());

// 2) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/incomes', incomeRouter);
app.use('/api/v1/catalogues', catalogueRouter);
app.use('/api/v1/spendings', spendingRouter);

// 3) Error handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

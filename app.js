const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const hpp = require('hpp');
const cors = require('cors');

const userRouter = require('./routes/userRoutes');
const incomeRouter = require('./routes/incomeRoutes');
const catalogueRouter = require('./routes/catalogueRoutes');
const spendingRouter = require('./routes/spendingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors());

// 1) GLOBAL MIDDLEWARE
// Set security HTTP headers
app.use(helmet()); //alway putting in begining
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // milisecond convert for 1 hours
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Body parser
// app.use(bodyParser.json());

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

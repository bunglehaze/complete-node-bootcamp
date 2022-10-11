
const express = require ('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));


}


app.use((req, res, next) => {
req.requestTime = new Date().toISOString();
next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    const err = new Error(`Cant's find ${req.originalUrl} on this server!`);

next(new AppError(`Cant's find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;


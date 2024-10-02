const AppError = require('../utils/appError');

const devError = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const prodError = (res, err) => {
  //errors passed by AppError class
  if (err?.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Other errors
  else {
    console.log(err, 'error');
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate filled value ${err?.keyValue?.name}. Please provide a unique name!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(errors.join('. '), 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token. Please login again', '401');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(process.env.NODE_ENV, 'nodeenv');
  if (process.env.NODE_ENV === 'development') {
    devError(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));
    if (error?.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err?.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if (err?.errors) {
      error = handleValidationErrorDB(error);
    }

    if (err?.name === 'JsonWebTokenError') {
      error = handleJWTError(err);
    }
    prodError(res, error);
  }
  
  next();
};

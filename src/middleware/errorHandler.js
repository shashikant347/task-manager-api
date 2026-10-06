const ApiError = require('../utils/ApiError');

exports.notFound = (req, _res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}.`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON body.';
  }

  // Never leak internals for unexpected errors
  if (statusCode === 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
};

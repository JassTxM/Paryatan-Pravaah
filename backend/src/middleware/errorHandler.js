const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { errorHandler };

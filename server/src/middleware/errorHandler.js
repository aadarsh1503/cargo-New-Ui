const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'An internal server error occurred',
      error: process.env.NODE_ENV === 'production' ? {} : err.message,
    });
  };
  
  module.exports = errorHandler;
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Request body must contain valid JSON.'
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body must be 20 KB or smaller.'
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong while generating the profile.'
  });
}

module.exports = errorHandler;

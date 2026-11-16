const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
};

export default notFoundMiddleware;
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') err.message = 'Image is too large (max 5 MB)';
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
  if (err.type === 'entity.parse.failed') statusCode = 400;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorMiddleware;

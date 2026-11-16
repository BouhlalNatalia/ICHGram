import mongoose from 'mongoose';

// validateObjectId('postId', 'commentId') — вернёт 400 вместо 500 CastError
export const validateObjectId = (...names) => (req, res, next) => {
  for (const name of names) {
    if (!mongoose.isValidObjectId(req.params[name])) {
      return res.status(400).json({ message: `Invalid ${name}` });
    }
  }
  next();
};

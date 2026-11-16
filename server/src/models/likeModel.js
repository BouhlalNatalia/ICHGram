import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true }
);

// Один пользователь — один лайк на пост / комментарий (защита от дублей при гонке запросов)
likeSchema.index({ user: 1, post: 1 }, { unique: true, partialFilterExpression: { post: { $exists: true } } });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $exists: true } } });

const Like = mongoose.model('Like', likeSchema);
export default Like;

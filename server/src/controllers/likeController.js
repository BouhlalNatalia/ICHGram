import Like from '../models/likeModel.js';
import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';
import Notification from '../models/notificationModel.js';
import { populatePostData } from '../utils/populatePost.js';
import { emitToAll, emitToUser } from '../sockets/socket.js';

// POST /api/likes/:postId — лайк / снятие лайка
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Like.findOne({ user: userId, post: postId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      await Notification.deleteOne({ fromUser: userId, post: postId, type: 'like' });
    } else {
      try {
        await Like.create({ user: userId, post: postId });
      } catch (e) {
        if (e.code !== 11000) throw e; // двойной клик: лайк уже есть
      }
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });

      if (post.user.toString() !== userId) {
        const notif = await Notification.findOneAndUpdate(
          { user: post.user, fromUser: userId, post: postId, type: 'like' },
          { $setOnInsert: { user: post.user, fromUser: userId, post: postId, type: 'like' } },
          { upsert: true, new: true }
        );
        emitToUser(post.user, 'notification', { type: 'like', _id: notif._id });
      }
    }

    const updatedPost = await populatePostData(Post.findById(postId).lean());
    emitToAll('postUpdated', updatedPost);

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/likes/:postId/comments/:commentId — лайк комментария
export const toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findOne({ _id: commentId, post: postId });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const existing = await Like.findOne({ user: userId, comment: commentId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
    } else {
      try {
        await Like.create({ user: userId, comment: commentId });
      } catch (e) {
        if (e.code !== 11000) throw e;
      }
      await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });
    }

    const updatedPost = await populatePostData(Post.findById(postId).lean());
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    emitToAll('postUpdated', updatedPost);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

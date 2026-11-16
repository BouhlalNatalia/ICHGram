import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import Notification from '../models/notificationModel.js';
import { populatePostData } from '../utils/populatePost.js';
import { emitToAll, emitToUser } from '../sockets/socket.js';

// POST /api/posts/:postId/comments   и   POST /api/comments/:postId
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    if (text.length > 2200) return res.status(400).json({ message: 'Comment is too long' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({ user: req.user.id, post: postId, text });
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

    if (post.user.toString() !== req.user.id) {
      const notif = await Notification.create({
        user: post.user,
        fromUser: req.user.id,
        type: 'comment',
        post: postId,
        commentText: text,
      });
      emitToUser(post.user, 'notification', { type: 'comment', _id: notif._id });
    }

    const updatedPost = await populatePostData(Post.findById(postId).lean());
    emitToAll('postUpdated', updatedPost);

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:postId/comments   и   GET /api/comments/:postId
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username avatar')
      .populate('likes', 'username')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

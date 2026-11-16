import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { toggleLike, toggleCommentLike } from '../controllers/likeController.js';

const router = express.Router();

router.post('/:postId', protect, validateObjectId('postId'), toggleLike);
router.post(
  '/:postId/comments/:commentId',
  protect,
  validateObjectId('postId', 'commentId'),
  toggleCommentLike
);

export default router;

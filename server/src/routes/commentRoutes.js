import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { addComment, getComments } from '../controllers/commentController.js';

const router = express.Router();

router.post('/:postId', protect, validateObjectId('postId'), addComment);
router.get('/:postId', validateObjectId('postId'), getComments);

export default router;

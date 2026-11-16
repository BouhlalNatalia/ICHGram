import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  getExplorePosts,
} from '../controllers/postController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import upload from '../utils/upload.js';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/explore/all', getExplorePosts);
router.get('/user/:id', validateObjectId('id'), getUserPosts);

router.post('/', protect, upload.single('image'), createPost);

router.get('/:postId/comments', validateObjectId('postId'), getComments);
router.post('/:postId/comments', protect, validateObjectId('postId'), addComment);

router.put('/:id', protect, validateObjectId('id'), upload.single('image'), updatePost);
router.delete('/:id', protect, validateObjectId('id'), deletePost);
router.get('/:id', validateObjectId('id'), getPostById);

export default router;

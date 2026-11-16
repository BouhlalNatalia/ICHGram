import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/followController.js';

const router = express.Router();

router.get('/:id/followers', validateObjectId('id'), getFollowers);
router.get('/:id/following', validateObjectId('id'), getFollowing);
router.post('/:id', protect, validateObjectId('id'), followUser);
router.delete('/:id', protect, validateObjectId('id'), unfollowUser);

export default router;

import express from 'express';
import upload from '../utils/upload.js';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import {
  getUserProfile,
  getUserByUsername,
  updateUserProfile,
  updatePassword,
   getFollowingActivity, 
} from '../controllers/userController.js';
import { toggleFollow } from '../controllers/followController.js';
import { searchUsers } from '../controllers/searchController.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/following-activity', protect, getFollowingActivity); 
router.get('/username/:username', getUserByUsername);

router.put('/update', protect, upload.single('avatar'), updateUserProfile);
router.put('/change-password', protect, updatePassword);

router.post('/:id/follow', protect, validateObjectId('id'), toggleFollow);
router.get('/:id', getUserProfile);

export default router;

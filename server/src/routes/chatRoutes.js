import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { getUserChats, accessChat, markAsRead, deleteChat } from '../controllers/chatController.js';

const router = express.Router();

router.get('/', protect, getUserChats);
router.post('/', protect, accessChat);
router.patch('/read/:chatId', protect, validateObjectId('chatId'), markAsRead);
router.delete('/:chatId', protect, validateObjectId('chatId'), deleteChat);

export default router;

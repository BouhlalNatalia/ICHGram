import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, validateObjectId('chatId'), getMessages);

export default router;

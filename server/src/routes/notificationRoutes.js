import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { 
  getNotifications, 
  markAsRead, 
  deleteNotification,
  deleteAllNotifications 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/mark-as-read', protect, markAsRead);
router.delete('/clear-all', protect, deleteAllNotifications);
router.delete('/:id', protect, validateObjectId('id'), deleteNotification);
export default router;
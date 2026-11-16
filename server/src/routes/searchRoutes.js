import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { searchUsers } from '../controllers/searchController.js';

const router = express.Router();

// GET /api/search?query=ivan
router.get('/', protect, searchUsers);

export default router;

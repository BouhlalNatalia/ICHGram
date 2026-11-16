import User from '../models/userModel.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/search?query=...   и   GET /api/users/search?query=...
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(200).json([]);
    }

    // Экранируем спецсимволы: иначе пользователь может прислать «тяжёлый» regex
    const pattern = escapeRegex(query.trim().slice(0, 50));

    const users = await User.find({
      $or: [
        { username: { $regex: pattern, $options: 'i' } },
        { fullName: { $regex: pattern, $options: 'i' } },
      ],
    })
      .select('username fullName avatar _id')
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Ошибка при поиске пользователей' });
  }
};

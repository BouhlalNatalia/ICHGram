import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { emitToUser } from '../sockets/socket.js';

// Общая логика: подписать / отписать. Возвращает { error } или { isFollowing }
const setFollow = async (meId, targetId, shouldFollow) => {
  if (String(meId) === String(targetId)) {
    return { status: 400, error: 'You cannot follow yourself' };
  }

  const target = await User.findById(targetId).select('_id');
  if (!target) return { status: 404, error: 'User not found' };

  if (shouldFollow) {
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: meId } });
    await User.findByIdAndUpdate(meId, { $addToSet: { following: targetId } });

    // Не плодим дубликаты уведомлений
    const created = await Notification.findOneAndUpdate(
      { user: targetId, fromUser: meId, type: 'follow' },
      { $setOnInsert: { user: targetId, fromUser: meId, type: 'follow' } },
      { upsert: true, new: true }
    );
    emitToUser(targetId, 'notification', { type: 'follow', _id: created._id });
  } else {
    await User.findByIdAndUpdate(targetId, { $pull: { followers: meId } });
    await User.findByIdAndUpdate(meId, { $pull: { following: targetId } });
    await Notification.deleteOne({ user: targetId, fromUser: meId, type: 'follow' });
  }

  return { isFollowing: shouldFollow };
};

const respond = (res, result, okMessage) => {
  if (result.error) return res.status(result.status).json({ message: result.error });
  return res.json({ isFollowing: result.isFollowing, message: okMessage });
};

// POST /api/follow/:id
export const followUser = async (req, res) => {
  try {
    const result = await setFollow(req.user.id, req.params.id, true);
    respond(res, result, 'Followed');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/follow/:id
export const unfollowUser = async (req, res) => {
  try {
    const result = await setFollow(req.user.id, req.params.id, false);
    respond(res, result, 'Unfollowed');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users/:id/follow  (переключатель — им пользуется клиент)
export const toggleFollow = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('following');
    const already = (me?.following || []).some((id) => String(id) === req.params.id);
    const result = await setFollow(req.user.id, req.params.id, !already);
    respond(res, result, result.isFollowing ? 'Followed' : 'Unfollowed');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/follow/:id/followers
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username fullName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json((user.followers || []).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/follow/:id/following
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fullName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json((user.following || []).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

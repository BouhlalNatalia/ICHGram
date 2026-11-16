
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import { removeUploadedFile } from '../utils/files.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinaryUpload.js';

const populateOptions = [
  { path: 'following', select: 'username fullName avatar' },
  { path: 'followers', select: 'username fullName avatar' },
];

const USERNAME_RE = /^[a-zA-Z0-9._]{3,30}$/;

const toProfile = (user) => {
  const obj = user.toObject();
  delete obj.password;
  obj.following = (obj.following || []).filter(Boolean);
  obj.followers = (obj.followers || []).filter(Boolean);
  return obj;
};

// Удаляет аватар независимо от места хранения.
const removeUserAvatar = async (avatar, publicId) => {
  if (publicId) {
    await deleteFromCloudinary(publicId);
  } else if (avatar) {
    await removeUploadedFile(avatar);
  }
};

// GET /api/users/:id
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await User.findOne({ username: id })
      .select('-password')
      .populate(populateOptions);

    if (!user && /^[0-9a-fA-F]{24}$/.test(id)) {
      user = await User.findById(id)
        .select('-password')
        .populate(populateOptions);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(toProfile(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/username/:username
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    })
      .select('-password')
      .populate(populateOptions);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(toProfile(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/update
export const updateUserProfile = async (req, res) => {
  let uploadedAvatar = null;
  let avatarSaved = false;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, fullName, bio, website } = req.body;

    if (
      typeof username === 'string' &&
      username.trim() &&
      username.trim() !== user.username
    ) {
      const newUsername = username.trim();

      if (!USERNAME_RE.test(newUsername)) {
        return res.status(400).json({
          message:
            'Username must be 3–30 characters: letters, digits, dot or underscore',
        });
      }

      const taken = await User.findOne({
        username: newUsername,
        _id: { $ne: user._id },
      });

      if (taken) {
        return res.status(409).json({
          message: 'Username is already taken',
        });
      }

      user.username = newUsername;
    }

    if (typeof fullName === 'string') {
      user.fullName = fullName.trim();
    }

    if (typeof bio === 'string') {
      if (bio.length > 150) {
        return res.status(400).json({
          message: 'Bio must be at most 150 characters',
        });
      }

      user.bio = bio;
    }

    if (typeof website === 'string') {
      user.website = website.trim();
    }

    let oldAvatar = null;
    let oldAvatarPublicId = null;

    if (req.file) {
      uploadedAvatar = await uploadToCloudinary(
        req.file.buffer,
        'ichgram/avatars'
      );

      oldAvatar = user.avatar;
      oldAvatarPublicId = user.avatarPublicId;

      user.avatar = uploadedAvatar.url;
      user.avatarPublicId = uploadedAvatar.publicId;
    }

    const updated = await user.save();
    avatarSaved = true;

    if (uploadedAvatar) {
      await removeUserAvatar(oldAvatar, oldAvatarPublicId);
    }

    res.json(updated);
  } catch (error) {
    if (uploadedAvatar && !avatarSaved) {
      await deleteFromCloudinary(uploadedAvatar.publicId);
    }

    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/change-password
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (
      typeof oldPassword !== 'string' ||
      typeof newPassword !== 'string'
    ) {
      return res.status(400).json({
        message: 'Old and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const NEW_POST_WINDOW_MS = 24 * 60 * 60 * 1000;

export const getFollowingActivity = async (req, res) => {
  try {
    const me = await User.findById(req.user._id).select('following');
    const ids = me?.following || [];

    if (!ids.length) {
      return res.json([]);
    }

    const [users, latest] = await Promise.all([
      User.find({ _id: { $in: ids } })
        .select('username fullName avatar'),
      Post.aggregate([
        { $match: { user: { $in: ids } } },
        {
          $group: {
            _id: '$user',
            lastPostAt: { $max: '$createdAt' },
          },
        },
      ]),
    ]);

    const lastByUser = new Map(
      latest.map((item) => [String(item._id), item.lastPostAt])
    );

    const now = Date.now();

    const result = users.map((user) => {
      const lastPostAt = lastByUser.get(String(user._id)) || null;

      return {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        lastPostAt,
        hasNewPost: lastPostAt
          ? now - new Date(lastPostAt).getTime() < NEW_POST_WINDOW_MS
          : false,
      };
    });

    result.sort(
      (a, b) =>
        Number(b.hasNewPost) - Number(a.hasNewPost) ||
        new Date(b.lastPostAt || 0) - new Date(a.lastPostAt || 0)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


import crypto from 'crypto';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail, isMailConfigured } from '../utils/sendEmail.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._]{3,30}$/;
const MIN_PASSWORD = 6;

const isString = (v) => typeof v === 'string';

const buildAuthResponse = (user, { withToken = true } = {}) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  bio: user.bio || '',
  website: user.website || '',
  avatar: user.avatar || '',
  followers: (user.followers || []).filter(Boolean),
  following: (user.following || []).filter(Boolean),
  ...(withToken && { token: generateToken(user._id) }),
});

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (![username, email, password].every(isString) || !username.trim() || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email, username and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    if (!USERNAME_RE.test(cleanUsername)) {
      return res
        .status(400)
        .json({ message: 'Username must be 3–30 characters: letters, digits, dot or underscore' });
    }

    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existing) {
      const field = existing.email === cleanEmail ? 'email' : 'username';
      return res.status(409).json({ message: `User with this ${field} already exists` });
    }

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password,
      fullName: isString(fullName) ? fullName.trim() : '',
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login (email or username + password)
export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = isString(email) ? email : username;

    if (!isString(identifier) || !isString(password) || !identifier.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const id = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: id.toLowerCase() }, { username: id }],
    })
      .populate('following', 'username avatar fullName')
      .populate('followers', 'username avatar fullName');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username avatar fullName')
      .populate('followers', 'username avatar fullName');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(buildAuthResponse(user, { withToken: false }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/forgot-password
// Creates a one-time token and sends a password reset link.
export const forgotPassword = async (req, res) => {
  const genericMessage = 'If an account with this email exists, a reset link has been sent';

  try {
    const { email } = req.body;

    if (!isString(email) || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const id = email.trim();

    const user = await User.findOne({
      $or: [{ email: id.toLowerCase() }, { username: id }],
    });

    // Do not reveal whether the account exists.
    if (!user) return res.status(200).json({ message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    if (isMailConfigured()) {
      await sendEmail({
        to: user.email,
        subject: 'ICHGram: password reset',
        text: `Reset your password (link valid for 15 minutes): ${resetUrl}`,
        html: `<p>Hi, ${user.username}!</p>
               <p>Click the link to reset your password (valid for 15 minutes):</p>
               <p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });

      return res.status(200).json({ message: genericMessage });
    }

    // Development mode when SMTP is not configured.
    console.log(`[reset-password] ${user.email}: ${resetUrl}`);

    res.status(200).json({
      message: genericMessage,
      ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
  }
};

// POST /api/auth/reset-password { token, password }
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!isString(token) || !isString(password) || !token) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

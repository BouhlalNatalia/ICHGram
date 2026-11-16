import mongoose from 'mongoose';
import Chat from '../models/chat.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

const PARTICIPANT_FIELDS = 'username avatar fullName';

// GET /api/chats — чаты текущего пользователя + счётчик непрочитанных
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', PARTICIPANT_FIELDS)
      .sort({ updatedAt: -1 });

    const unread = await Message.aggregate([
      { $match: { chat: { $in: chats.map((c) => c._id) }, sender: { $ne: userId }, read: false } },
      { $group: { _id: '$chat', count: { $sum: 1 } } },
    ]);
    const unreadByChat = new Map(unread.map((u) => [String(u._id), u.count]));

    res.status(200).json(
      chats.map((chat) => ({ ...chat.toObject(), unreadCount: unreadByChat.get(String(chat._id)) || 0 }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чатов', error: error.message });
  }
};

// POST /api/chats  { userId } — найти или создать чат с пользователем
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const me = req.user._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    if (String(userId) === String(me)) {
      return res.status(400).json({ message: 'You cannot chat with yourself' });
    }
    if (!(await User.exists({ _id: userId }))) {
      return res.status(404).json({ message: 'User not found' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [me, userId], $size: 2 },
    }).populate('participants', PARTICIPANT_FIELDS);

    if (chat) return res.status(200).json(chat);

    const created = await Chat.create({ participants: [me, userId] });
    chat = await Chat.findById(created._id).populate('participants', PARTICIPANT_FIELDS);

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при создании чата', error: error.message });
  }
};

// Общая проверка: чат существует и пользователь в нём участвует
export const getChatForUser = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return { status: 404, error: 'Чат не найден' };
  const isParticipant = chat.participants.some((p) => String(p) === String(userId));
  if (!isParticipant) return { status: 403, error: 'Нет доступа к этому чату' };
  return { chat };
};

// PATCH /api/chats/read/:chatId
export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const check = await getChatForUser(chatId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Чат помечен как прочитанный' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса сообщений', error: error.message });
  }
};

// DELETE /api/chats/:chatId
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const check = await getChatForUser(chatId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: 'Чат и история сообщений успешно удалены' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении чата', error: error.message });
  }
};

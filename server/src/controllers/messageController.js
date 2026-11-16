import Message from '../models/messageModel.js';
import Chat from '../models/chat.js';
import { getChatForUser } from './chatController.js';
import { emitToUser } from '../sockets/socket.js';

// POST /api/messages  { chatId, text } — сохраняем и отправляем получателю через Socket.io
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

    if (!chatId || !text) {
      return res.status(400).json({ message: 'Не указан ID чата или текст сообщения' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Сообщение слишком длинное' });
    }

    const mongooseId = /^[0-9a-fA-F]{24}$/.test(String(chatId));
    if (!mongooseId) return res.status(400).json({ message: 'Invalid chatId' });

    const check = await getChatForUser(chatId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const receiver = check.chat.participants.find((p) => String(p) !== String(req.user._id));

    let message = await Message.create({
      sender: req.user._id,
      receiver,
      text,
      chat: chatId,
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

    message = await message.populate('sender', 'username avatar');
    const payload = message.toObject();

    // Реальное сохранённое сообщение (с настоящим _id) уходит получателю в его комнату
    if (receiver) emitToUser(receiver, 'receiveMessage', payload);

    res.status(201).json(payload);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/messages/:chatId
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const check = await getChatForUser(chatId, req.user._id);
    if (check.error) return res.status(check.status).json({ message: check.error });

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar email')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Ошибка при получении истории сообщений:', error);
    res.status(500).json({ message: error.message });
  }
};

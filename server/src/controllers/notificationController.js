import Notification from '../models/notificationModel.js';

/**
 * ПОЛУЧЕНИЕ УВЕДОМЛЕНИЙ ДЛЯ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ  
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getNotifications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const notifications = await Notification.find({
      user: req.user.id,
    })
      .populate('fromUser', 'username avatar followers')
      .populate('post', 'image')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (error) {
    console.error('Ошибка при получении уведомлений:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении уведомлений' });
  }
};

/**
 * ПОМЕТИТЬ ВСЕ УВЕДОМЛЕНИЯ КАК ПРОЧИТАННЫЕ
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const markAsRead = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Уведомления помечены как прочитанные' });
  } catch (error) {
    console.error('Ошибка при обновлении уведомлений:', error);
    res.status(500).json({ message: 'Не удалось обновить статус уведомлений' });
  }
};

/**
 * УДАЛЕНИЕ ОДНОГО УВЕДОМЛЕНИЯ
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    if (String(notification.user) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Нет прав на удаление этого уведомления' });
    }

    await notification.deleteOne();
    res.json({ message: 'Уведомление удалено' });
  } catch (error) {
    console.error('Ошибка при удалении уведомления:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении' });
  }
};

/**
 * ПОЛНАЯ ОЧИСТКА УВЕДОМЛЕНИЙ
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    await Notification.deleteMany({ user: req.user.id });

    res.json({ message: 'Все уведомления успешно удалены' });
  } catch (error) {
    console.error('Ошибка при полной очистке уведомлений:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении всех уведомлений' });
  }
};
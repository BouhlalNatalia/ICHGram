// 1. Форматирование даты для модальных окон (DD Month YYYY)
export const formatDate = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();

  return year === currentYear ? `${day} ${month}` : `${day} ${month} ${year}`;
};

// 2. Умная дата для PostModal (переключается между "ago" и точной датой)
export const getSmartDate = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return '';

  const postedDate = new Date(dateInput);
  const now = new Date();
  const diffInMs = now.getTime() - postedDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Если прошло меньше 7 дней — используем относительное время
  if (diffInDays < 7) {
    return formatRelativeTime(dateInput, true) + ' ago';
  }

  // Если больше 7 дней — возвращаем точную дату
  return formatDate(dateInput);
};

// 3. Формат для чатов (например: May 21, 2026, 09:31 PM)
export const formatChatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// 4. Логика относительного времени ("2 m", "5 h", "2 d")
export const formatRelativeTime = (
  dateInput: string | Date | undefined, 
  isFullFormat: boolean = false
): string => {
  if (!dateInput) return 'now';

  const now = new Date();
  const postedDate = new Date(dateInput);

  if (isNaN(postedDate.getTime())) {
    return 'now';
  }

  const diffInMs = now.getTime() - postedDate.getTime();
  if (diffInMs <= 0) return 'now';

  const diffInSeconds = Math.floor(diffInMs / 1000);

  if (diffInSeconds < 60) {
    return 'now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isFullFormat 
      ? `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'}` 
      : `${diffInMinutes} m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isFullFormat 
      ? `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'}` 
      : `${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return isFullFormat 
      ? `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}` 
      : `${diffInDays} d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return isFullFormat 
      ? `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'}` 
      : `${diffInWeeks} w`;
  }

  return postedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};
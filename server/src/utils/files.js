import fs from 'fs/promises';
import path from 'path';

// Удаляет файл из папки uploads (путь вида "uploads/xxx.jpg"). Ошибки игнорируем.
export const removeUploadedFile = async (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') return;
  if (!relativePath.startsWith('uploads/')) return;
  const filePath = path.join(process.cwd(), 'uploads', path.basename(relativePath));
  try {
    await fs.unlink(filePath);
  } catch {
    /* файла может не быть — это нормально */
  }
};

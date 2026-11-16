
const isProduction = import.meta.env.PROD;

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isProduction ? '/api' : 'http://localhost:5000/api');

export const SERVER_URL = isProduction
  ? ''
  : API_URL.replace(/\/api$/, '');

export const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

export const getImageUrl = (
  path: string | null | undefined
): string => {
  if (!path || path.trim() === '') {
    return DEFAULT_AVATAR;
  }

  const cleanStr = path.toString().trim().replace(/['"]+/g, '');

  if (cleanStr.startsWith('http')) {
    return cleanStr;
  }

  const finalPath = cleanStr.replace(/\\/g, '/').replace(/^\//, '');

  return `${SERVER_URL}/${finalPath}`;
};

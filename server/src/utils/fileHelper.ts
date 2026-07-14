import path from 'path';

// 文件类型映射
export const FILE_TYPE_MAP = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  html: ['text/html', 'application/zip', 'application/x-zip-compressed'],
  homepage: ['application/zip', 'application/x-zip-compressed']
};

// 文件大小限制（字节）
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  html: 20 * 1024 * 1024,      // 20MB
  homepage: 100 * 1024 * 1024 // 100MB
};

// 文件扩展名映射
export const FILE_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  video: ['.mp4', '.webm'],
  html: ['.html', '.htm', '.zip'],
  homepage: ['.zip']
};

// 验证文件类型
export function validateFileType(
  mimeType: string,
  filename: string,
  type: 'image' | 'video' | 'html' | 'homepage'
): boolean {
  const extension = getFileExtension(filename);
  return FILE_TYPE_MAP[type].includes(mimeType) || FILE_EXTENSIONS[type].includes(extension);
}

// 验证文件大小
export function validateFileSize(
  size: number,
  type: 'image' | 'video' | 'html' | 'homepage'
): boolean {
  return size <= FILE_SIZE_LIMITS[type];
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// 获取MIME类型
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.zip': 'application/zip'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

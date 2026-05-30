import { Artwork } from '../types';

// 文件类型映射
const FILE_TYPE_MAP = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm'],
  html: ['text/html', 'application/zip']
};

// 文件大小限制（字节）
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
  html: 20 * 1024 * 1024   // 20MB
};

// 验证文件类型
export function validateFileType(file: File, type: 'image' | 'video' | 'html'): boolean {
  return FILE_TYPE_MAP[type].includes(file.type);
}

// 验证文件大小
export function validateFileSize(file: File, type: 'image' | 'video' | 'html'): boolean {
  return file.size <= FILE_SIZE_LIMITS[type];
}

// 将文件转换为Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 从Base64提取MIME类型
export function getMimeTypeFromBase64(base64: string): string {
  const match = base64.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'application/octet-stream';
}

// 生成缩略图（仅用于图片）
export async function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        // 缩略图尺寸
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// 获取文件扩展名
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// 创建对象URL
export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

// 撤销对象URL
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

// 创建HTML预览内容
export function createHtmlPreview(artwork: Artwork): string {
  if (artwork.type !== 'html') return '';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${artwork.title}</title>
        <style>
          body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
        </style>
      </head>
      <body>
        ${artwork.fileData}
      </body>
    </html>
  `;
}

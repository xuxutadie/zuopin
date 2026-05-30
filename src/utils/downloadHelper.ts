import JSZip from 'jszip';
import { Artwork } from '../types';
import { getMimeTypeFromBase64 } from './fileHelper';

// 单个文件下载
export function downloadSingleFile(artwork: Artwork): void {
  const link = document.createElement('a');
  link.href = artwork.fileData;
  link.download = artwork.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 批量下载（打包为ZIP）
export async function downloadMultipleFiles(artworks: Artwork[]): Promise<void> {
  const zip = new JSZip();
  
  for (const artwork of artworks) {
    // 根据数据类型处理文件内容
    if (artwork.type === 'html') {
      // HTML文件需要解码Base64
      const base64Data = artwork.fileData.split(',')[1];
      if (base64Data) {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        zip.file(artwork.fileName, bytes);
      }
    } else {
      // 图片和视频保持Base64格式
      zip.file(artwork.fileName, artwork.fileData);
    }
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `artworks_${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// 创建文件预览URL
export function createPreviewUrl(artwork: Artwork): string {
  return artwork.fileData;
}

// 打开HTML作品预览
export function previewHtmlWork(artwork: Artwork): void {
  if (artwork.type !== 'html') return;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${artwork.title}</title>
      </head>
      <body>
        ${artwork.fileData}
      </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // 清理URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import JSZip from 'jszip';
import { Artwork } from '../types';

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 80) || '未命名作品';
}

function getFileExtension(artwork: Artwork): string {
  const matched = artwork.fileName.match(/\.[^.]+$/);
  if (matched) return matched[0];

  if (artwork.type === 'image') return '.png';
  if (artwork.type === 'video') return '.mp4';
  return '.html';
}

function getDownloadName(artwork: Artwork): string {
  const title = sanitizeFileName(artwork.title);
  const extension = getFileExtension(artwork);
  return title.toLowerCase().endsWith(extension.toLowerCase())
    ? title
    : `${title}${extension}`;
}

async function fetchArtworkBlob(artwork: Artwork): Promise<Blob> {
  const response = await fetch(artwork.fileData);
  if (!response.ok) {
    throw new Error('文件下载失败');
  }

  return response.blob();
}

// 单个文件下载，文件名使用学生提交时填写的作品名称
export async function downloadSingleFile(artwork: Artwork): Promise<void> {
  const blob = await fetchArtworkBlob(artwork);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = getDownloadName(artwork);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// 批量下载，压缩包内文件名同样使用作品名称
export async function downloadMultipleFiles(artworks: Artwork[]): Promise<void> {
  const zip = new JSZip();

  for (const artwork of artworks) {
    const blob = await fetchArtworkBlob(artwork);
    zip.file(getDownloadName(artwork), blob);
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
  if (artwork.type !== 'html' && artwork.type !== 'homepage') return;

  if (artwork.shareUrl) {
    window.open(artwork.shareUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const fileName = artwork.fileName.toLowerCase();
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    window.open(artwork.fileData, '_blank', 'noopener,noreferrer');
    return;
  }

  alert('该静态网站暂时没有可用的在线预览入口。');
}

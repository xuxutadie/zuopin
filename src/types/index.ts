// 用户类型
export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: number;
}

export type ArtworkType = 'image' | 'video' | 'html' | 'homepage';

// 老师端学生明细
export interface StudentSummary {
  id: string;
  name: string;
  createdAt: string;
  workCount: number;
  publicWorkCount: number;
  imageCount: number;
  videoCount: number;
  htmlCount: number;
  homepageCount: number;
  lastSubmittedAt: string | null;
}

// 作品类型
export interface Artwork {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  type: ArtworkType;
  fileName: string;
  fileData: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
  thumbnail?: string;         // 缩略图 URL，所有类型作品都统一使用
  thumbnailPath?: string | null; // 原始返回的 thumbnail_path，便于调试
  htmlEntryPath?: string | null; // 静态网站 ZIP 解压后的入口页面路径
  isPublic?: boolean;          // 是否在作品广场公开
  shareUrl?: string;            // HTML 作品分享链接（直接打开文件）
}

// 表单数据类型
export interface ArtworkFormData {
  title: string;
  description: string;
  type: ArtworkType;
  file: File | null;
}

// 筛选条件
export interface FilterOptions {
  type?: ArtworkType;
  search?: string;
  studentName?: string;
}

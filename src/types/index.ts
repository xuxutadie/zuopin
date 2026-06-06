// 用户类型
export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: number;
}

// 作品类型
export interface Artwork {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'html';
  fileName: string;
  fileData: string;
  fileSize: number;
  mimeType: string;
  createdAt: number;
  thumbnail?: string;
  shareUrl?: string;
}

// 表单数据类型
export interface ArtworkFormData {
  title: string;
  description: string;
  type: 'image' | 'video' | 'html';
  file: File | null;
}

// 筛选条件
export interface FilterOptions {
  type?: 'image' | 'video' | 'html';
  search?: string;
  studentName?: string;
}

import { create } from 'zustand';
import { Artwork, FilterOptions } from '../types';
import { artworkApi, adminApi } from '../utils/api';
import { User } from '../types';

interface ArtworkState {
  artworks: Artwork[];
  myWorks: Artwork[];
  isLoading: boolean;

  // 初始化加载
  initialize: () => void;

  // 获取我的作品
  fetchMyWorks: () => Promise<void>;
  getStudentWorks: (studentId: string) => Artwork[];
  filterArtworks: (options?: FilterOptions) => Artwork[];

  // 提交作品
  submitArtwork: (
    user: User,
    title: string,
    description: string,
    type: 'image' | 'video' | 'html',
    file: File
  ) => Promise<{ success: boolean; error?: string; artwork?: Artwork }>;

  // 删除作品
  deleteArtwork: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 老师删除学生作品
  deleteAdminArtwork: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 获取所有作品（老师端）
  fetchAllArtworks: (options?: FilterOptions) => Promise<void>;

  // 批量下载
  batchDownload: (artworkIds: string[]) => Promise<{ success: boolean; error?: string }>;

  // 获取统计数据
  fetchStats: () => Promise<{
    totalWorks: number;
    totalStudents: number;
    typeStats: { image: number; video: number; html: number };
  }>;
}

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  artworks: [],
  myWorks: [],
  isLoading: false,

  initialize: () => {
    set({ isLoading: true });
    // 初始化时可以预加载数据
    set({ isLoading: false });
  },

  fetchMyWorks: async () => {
    try {
      const result = await artworkApi.getMyWorks();
      
      if (result.success && result.data) {
        const artworks = result.data.artworks.map((a: any) => ({
          id: a.id,
          studentId: a.studentId,
          studentName: a.studentName,
          title: a.title,
          description: a.description,
          type: a.type,
          fileName: a.fileName,
          fileData: artworkApi.getFileUrl(a.filePath),
          shareUrl: artworkApi.getHtmlShareUrl(a.filePath, a.fileName),
          thumbnail: a.type === 'image' ? artworkApi.getFileUrl(a.filePath) : undefined,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          createdAt: new Date(a.createdAt).getTime()
        }));
        
        set({ myWorks: artworks });
      }
    } catch (error) {
      console.error('获取作品列表失败:', error);
    }
  },

  getStudentWorks: (studentId) => {
    return get().myWorks.filter(artwork => artwork.studentId === studentId);
  },

  filterArtworks: (options) => {
    const search = options?.search?.trim().toLowerCase();

    return get().artworks.filter(artwork => {
      if (options?.type && artwork.type !== options.type) {
        return false;
      }

      if (options?.studentName && artwork.studentName !== options.studentName) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        artwork.title.toLowerCase().includes(search) ||
        artwork.studentName.toLowerCase().includes(search) ||
        artwork.description.toLowerCase().includes(search)
      );
    });
  },

  submitArtwork: async (user, title, description, type, file) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('file', file);

      const result = await artworkApi.submit(formData);
      
      if (result.success && result.data?.artwork) {
        const artwork = {
          id: result.data.artwork.id,
          studentId: result.data.artwork.studentId,
          studentName: result.data.artwork.studentName,
          title: result.data.artwork.title,
          description: result.data.artwork.description,
          type: result.data.artwork.type,
          fileName: result.data.artwork.fileName,
          fileData: artworkApi.getFileUrl(result.data.artwork.filePath),
          shareUrl: artworkApi.getHtmlShareUrl(result.data.artwork.filePath, result.data.artwork.fileName),
          thumbnail: result.data.artwork.type === 'image'
            ? artworkApi.getFileUrl(result.data.artwork.filePath)
            : undefined,
          fileSize: result.data.artwork.fileSize,
          mimeType: result.data.artwork.mimeType,
          createdAt: new Date(result.data.artwork.createdAt).getTime()
        } satisfies Artwork;

        // 重新获取作品列表
        await get().fetchMyWorks();
        return { success: true, artwork };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: '提交失败，请重试' };
    }
  },

  deleteArtwork: async (id) => {
    try {
      const result = await artworkApi.deleteWork(id);
      
      if (result.success) {
        // 从列表中移除
        set(state => ({
          myWorks: state.myWorks.filter(w => w.id !== id)
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: '删除失败，请重试' };
    }
  },

  deleteAdminArtwork: async (id) => {
    try {
      const result = await adminApi.deleteArtwork(id);

      if (result.success) {
        set(state => ({
          artworks: state.artworks.filter(w => w.id !== id)
        }));
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: '删除失败，请重试' };
    }
  },

  fetchAllArtworks: async (options) => {
    try {
      const result = await adminApi.getAllArtworks({
        type: options?.type,
        search: options?.search
      });
      
      if (result.success && result.data) {
        const artworks = result.data.artworks.map((a: any) => ({
          id: a.id,
          studentId: a.studentId,
          studentName: a.studentName,
          title: a.title,
          description: a.description,
          type: a.type,
          fileName: a.fileName,
          fileData: artworkApi.getFileUrl(a.filePath),
          shareUrl: artworkApi.getHtmlShareUrl(a.filePath, a.fileName),
          thumbnail: a.type === 'image' ? artworkApi.getFileUrl(a.filePath) : undefined,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          createdAt: new Date(a.createdAt).getTime()
        }));
        
        set({ artworks });
      }
    } catch (error) {
      console.error('获取作品列表失败:', error);
    }
  },

  batchDownload: async (artworkIds) => {
    try {
      const result = await adminApi.batchDownload(artworkIds);
      return result;
    } catch (error) {
      return { success: false, error: '下载失败，请重试' };
    }
  },

  fetchStats: async () => {
    try {
      const result = await adminApi.getStats();
      
      if (result.success && result.data) {
        return {
          totalWorks: result.data.totalWorks,
          totalStudents: result.data.totalStudents,
          typeStats: result.data.typeStats
        };
      }
      
      return {
        totalWorks: 0,
        totalStudents: 0,
        typeStats: { image: 0, video: 0, html: 0 }
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {
        totalWorks: 0,
        totalStudents: 0,
        typeStats: { image: 0, video: 0, html: 0 }
      };
    }
  }
}));

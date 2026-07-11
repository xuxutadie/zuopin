import { create } from 'zustand';
import { Artwork, FilterOptions, StudentSummary } from '../types';
import { artworkApi, adminApi, ArtworkApiItem } from '../utils/api';
import { User } from '../types';

interface ArtworkState {
  artworks: Artwork[];
  myWorks: Artwork[];
  publicWorks: Artwork[];
  students: StudentSummary[];
  isLoading: boolean;

  // 初始化加载
  initialize: () => void;

  // 获取我的作品
  fetchMyWorks: () => Promise<void>;
  getStudentWorks: (studentId: string) => Artwork[];
  filterArtworks: (options?: FilterOptions) => Artwork[];

  // 获取公开作品广场
  fetchPublicWorks: (options?: FilterOptions) => Promise<void>;

  // 提交作品
  submitArtwork: (
    user: User,
    title: string,
    description: string,
    type: 'image' | 'video' | 'html',
    file: File,
    options?: { thumbnail?: File | null; isPublic?: boolean }
  ) => Promise<{ success: boolean; error?: string; artwork?: Artwork }>;

  // 删除作品
  deleteArtwork: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 老师删除学生作品
  deleteAdminArtwork: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 老师设置作品是否展示在作品广场
  toggleArtworkPublic: (id: string, isPublic: boolean) => Promise<{ success: boolean; error?: string }>;

  // 获取所有作品（老师端）
  fetchAllArtworks: (options?: FilterOptions) => Promise<void>;

  // 获取注册学生明细（老师端）
  fetchStudents: () => Promise<void>;

  // 删除注册学生（老师端）
  deleteStudent: (id: string) => Promise<{ success: boolean; error?: string }>;

  // 批量下载
  batchDownload: (artworkIds: string[]) => Promise<{ success: boolean; error?: string }>;

  // 获取统计数据
  fetchStats: () => Promise<{
    totalWorks: number;
    totalStudents: number;
    typeStats: { image: number; video: number; html: number };
  }>;
}

// 根据后端返回的原始数据统一映射为前端 Artwork 对象
function mapArtwork(a: ArtworkApiItem): Artwork {
  // 缩略图 URL：优先使用 thumbnail_path，否则 image 类型使用 file_path
  const thumbFile = a.thumbnailPath || a.thumbnail_path;
  const filePath = a.filePath || a.file_path;
  const htmlEntryPath = a.htmlEntryPath || a.html_entry_path || null;
  const htmlPreviewPath = htmlEntryPath || filePath;
  const fileForThumb = thumbFile || (a.type === 'image' ? filePath : null);
  const thumbnailUrl = fileForThumb ? artworkApi.getFileUrl(fileForThumb) : undefined;

  return {
    id: a.id,
    studentId: a.studentId || a.student_id,
    studentName: a.studentName || a.student_name,
    title: a.title,
    description: a.description || '',
    type: a.type,
    fileName: a.fileName || a.file_name,
    fileData: artworkApi.getFileUrl(filePath),
    shareUrl: artworkApi.getHtmlShareUrl(htmlPreviewPath, a.fileName || a.file_name),
    thumbnail: thumbnailUrl,
    thumbnailPath: a.thumbnailPath || a.thumbnail_path || null,
    htmlEntryPath,
    isPublic: typeof a.isPublic === 'boolean' ? a.isPublic : !!a.is_public,
    fileSize: a.fileSize || a.file_size,
    mimeType: a.mimeType || a.mime_type,
    createdAt: new Date(a.createdAt || a.created_at).getTime()
  };
}

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  artworks: [],
  myWorks: [],
  publicWorks: [],
  students: [],
  isLoading: false,

  initialize: () => {
    set({ isLoading: true });
    set({ isLoading: false });
  },

  fetchMyWorks: async () => {
    try {
      const result = await artworkApi.getMyWorks();
      
      if (result.success && result.data) {
        const artworks = result.data.artworks.map(mapArtwork);
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

  fetchPublicWorks: async (options) => {
    try {
      set({ isLoading: true });
      const result = await artworkApi.getPublicWorks({
        type: options?.type,
        search: options?.search
      });

      if (result.success && result.data) {
        const artworks = result.data.artworks.map(mapArtwork);
        set({ publicWorks: artworks });
      }
    } catch (error) {
      console.error('获取作品广场失败:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  submitArtwork: async (user, title, description, type, file, options) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('file', file);

      // 可选：封面缩略图
      if (options?.thumbnail) {
        formData.append('thumbnail', options.thumbnail);
      }
      // 可选：是否公开到作品广场
      if (typeof options?.isPublic === 'boolean') {
        formData.append('is_public', String(options.isPublic));
      }

      const result = await artworkApi.submit(formData);
      
      if (result.success && result.data?.artwork) {
        const artwork = mapArtwork(result.data.artwork);

        // 重新获取作品列表
        await get().fetchMyWorks();
        return { success: true, artwork };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: '提交失败，请重试' };
    }
  },

  deleteArtwork: async (id) => {
    try {
      const result = await artworkApi.deleteWork(id);
      
      if (result.success) {
        set(state => ({
          myWorks: state.myWorks.filter(w => w.id !== id),
          publicWorks: state.publicWorks.filter(w => w.id !== id)
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: '删除失败，请重试' };
    }
  },

  deleteAdminArtwork: async (id) => {
    try {
      const result = await adminApi.deleteArtwork(id);

      if (result.success) {
        set(state => ({
          artworks: state.artworks.filter(w => w.id !== id),
          publicWorks: state.publicWorks.filter(w => w.id !== id)
        }));
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch {
      return { success: false, error: '删除失败，请重试' };
    }
  },

  toggleArtworkPublic: async (id, isPublic) => {
    try {
      const result = await adminApi.updateArtworkPublic(id, isPublic);

      if (!result.success || !result.data?.artwork) {
        return { success: false, error: result.error || '更新展示状态失败' };
      }

      const updatedArtwork = mapArtwork(result.data.artwork);

      set(state => {
        const updateItem = (artwork: Artwork) =>
          artwork.id === id ? updatedArtwork : artwork;

        return {
          artworks: state.artworks.map(updateItem),
          myWorks: state.myWorks.map(updateItem),
          publicWorks: updatedArtwork.isPublic
            ? [
                updatedArtwork,
                ...state.publicWorks.filter(artwork => artwork.id !== id)
              ]
            : state.publicWorks.filter(artwork => artwork.id !== id)
        };
      });

      return { success: true };
    } catch {
      return { success: false, error: '更新展示状态失败，请重试' };
    }
  },

  fetchAllArtworks: async (options) => {
    try {
      const result = await adminApi.getAllArtworks({
        type: options?.type,
        search: options?.search
      });
      
      if (result.success && result.data) {
        const artworks = result.data.artworks.map(mapArtwork);
        set({ artworks });
      }
    } catch (error) {
      console.error('获取作品列表失败:', error);
    }
  },

  fetchStudents: async () => {
    try {
      const result = await adminApi.getStudents();

      if (result.success && result.data) {
        set({ students: result.data.students });
      }
    } catch (error) {
      console.error('获取学生明细失败:', error);
    }
  },

  deleteStudent: async (id) => {
    try {
      const result = await adminApi.deleteStudent(id);

      if (!result.success) {
        return { success: false, error: result.error || '删除学生失败' };
      }

      set(state => ({
        students: state.students.filter(student => student.id !== id),
        artworks: state.artworks.filter(artwork => artwork.studentId !== id),
        publicWorks: state.publicWorks.filter(artwork => artwork.studentId !== id)
      }));

      return { success: true };
    } catch {
      return { success: false, error: '删除学生失败，请重试' };
    }
  },

  batchDownload: async (artworkIds) => {
    try {
      const result = await adminApi.batchDownload(artworkIds);
      return result;
    } catch {
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

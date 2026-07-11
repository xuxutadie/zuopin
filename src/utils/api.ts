// API配置。本地开发默认连接线上后端；如需连接本地后端，可设置 VITE_API_URL。
const LOCAL_DEV_API_URL = 'https://zuopin-api.zeabur.app/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? LOCAL_DEV_API_URL : '/api');

function getApiEndpointBase(): string {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return API_BASE_URL;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${API_BASE_URL}`;
}

function joinApiPath(base: string, path: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

// 获取存储的Token
function getToken(): string | null {
  return localStorage.getItem('artwork_token');
}

// 设置Token
export function setToken(token: string): void {
  localStorage.setItem('artwork_token', token);
}

// 清除Token
export function clearToken(): void {
  localStorage.removeItem('artwork_token');
}

function clearStoredSession(): void {
  clearToken();
  localStorage.removeItem('artwork_user');
}

function getResponseError(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('error' in data)) {
    return undefined;
  }

  const error = (data as { error?: unknown }).error;
  return typeof error === 'string' ? error : undefined;
}

function isAuthExpired(response: Response, data: unknown): boolean {
  return response.status === 401
    || response.status === 403
    || getResponseError(data) === 'Token无效或已过期';
}

function handleAuthExpired(response: Response, data: unknown): void {
  if (!isAuthExpired(response, data)) {
    return;
  }

  clearStoredSession();

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login?reason=expired';
  }
}

// API响应类型
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ArtworkApiItem {
  id: string;
  studentId?: string;
  student_id?: string;
  studentName?: string;
  student_name?: string;
  title: string;
  description?: string | null;
  type: 'image' | 'video' | 'html';
  fileName?: string;
  file_name?: string;
  filePath?: string;
  file_path?: string;
  thumbnailPath?: string | null;
  thumbnail_path?: string | null;
  isPublic?: boolean;
  is_public?: boolean;
  fileSize?: number;
  file_size?: number;
  mimeType?: string;
  mime_type?: string;
  createdAt?: string | number;
  created_at?: string | number;
}

export interface StudentSummaryItem {
  id: string;
  name: string;
  createdAt: string;
  workCount: number;
  publicWorkCount: number;
  imageCount: number;
  videoCount: number;
  htmlCount: number;
  lastSubmittedAt: string | null;
}

async function readResponseData(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipAuthExpiredRedirect?: boolean;
}

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const { skipAuth, skipAuthExpiredRedirect, ...fetchOptions } = options;
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    });

    const data = await readResponseData(response);

    if (!response.ok) {
      if (!skipAuthExpiredRedirect) {
        handleAuthExpired(response, data);
      }
      return {
          success: false,
          error: !skipAuthExpiredRedirect && isAuthExpired(response, data)
            ? '登录已失效，请重新登录'
            : getResponseError(data) || `请求失败（${response.status}）`
      };
    }

    return {
      success: true,
      data: data as T
    };
  } catch (error) {
    console.error('API请求错误:', error);
    return {
      success: false,
      error: '网络错误，请检查连接'
    };
  }
}

// 用户认证API
export const authApi = {
  // 学生注册
  register: async (name: string, password: string) => {
    return request<{
      user: { id: string; name: string; role: string };
      token: string;
    }>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      skipAuthExpiredRedirect: true,
      body: JSON.stringify({ name, role: 'student', password })
    });
  },

  // 用户登录
  login: async (name: string, role: 'student' | 'teacher', password?: string) => {
    return request<{
      user: { id: string; name: string; role: string };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      skipAuthExpiredRedirect: true,
      body: JSON.stringify({ name, role, password })
    });
  }
};

// 作品API
export const artworkApi = {
  // 提交作品（支持可选 thumbnail 封面图 和 is_public 公开开关）
  submit: async (formData: FormData): Promise<ApiResponse<{ artwork: ArtworkApiItem }>> => {
    const token = getToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/artworks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        handleAuthExpired(response, data);
        return {
          success: false,
          error: isAuthExpired(response, data)
            ? '登录已失效，请重新登录'
            : getResponseError(data) || `提交失败（${response.status}）`
        };
      }

      return {
        success: true,
        data: data as { artwork: ArtworkApiItem }
      };
    } catch (error) {
      console.error('提交作品错误:', error);
      return {
        success: false,
        error: '网络错误，请检查连接'
      };
    }
  },

  // 获取我的作品列表
  getMyWorks: async () => {
    return request<{
      artworks: ArtworkApiItem[];
    }>('/artworks/my');
  },

  // 获取公开作品广场列表（无需登录）
  getPublicWorks: async (params?: { type?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request<{
      artworks: ArtworkApiItem[];
    }>(`/artworks/public${query ? `?${query}` : ''}`);
  },

  // 删除作品
  deleteWork: async (id: string) => {
    return request(`/artworks/${id}`, {
      method: 'DELETE'
    });
  },

  // 获取文件URL
  getFileUrl: (filename: string) => {
    return joinApiPath(API_BASE_URL, `/files/${filename}`);
  },

  // 获取公开可访问的文件URL
  getPublicFileUrl: (filename: string) => {
    return joinApiPath(getApiEndpointBase(), `/files/${filename}`);
  },

  // 获取单个 HTML 文件的分享链接
  getHtmlShareUrl: (storedFilename: string, originalFileName: string) => {
    const normalizedName = originalFileName.toLowerCase();
    if (!normalizedName.endsWith('.html') && !normalizedName.endsWith('.htm')) {
      return undefined;
    }

    return joinApiPath(getApiEndpointBase(), `/files/${storedFilename}`);
  }
};

// 管理员API
export const adminApi = {
  // 获取所有作品
  getAllArtworks: async (params?: { type?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    return request<{
      artworks: ArtworkApiItem[];
    }>(`/admin/artworks${query ? `?${query}` : ''}`);
  },

  // 老师删除作品
  deleteArtwork: async (id: string) => {
    return request(`/admin/artworks/${id}`, {
      method: 'DELETE'
    });
  },

  // 老师设置作品是否展示在作品广场
  updateArtworkPublic: async (id: string, isPublic: boolean) => {
    return request<{
      artwork: ArtworkApiItem;
    }>(`/admin/artworks/${id}/public`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic })
    });
  },

  // 获取注册学生明细
  getStudents: async () => {
    return request<{
      students: StudentSummaryItem[];
    }>('/admin/artworks/students');
  },

  // 删除注册学生及其作品
  deleteStudent: async (id: string) => {
    return request(`/admin/artworks/students/${id}`, {
      method: 'DELETE'
    });
  },

  // 下载单个作品
  downloadArtwork: async (id: string) => {
    const token = getToken();
    window.open(`${API_BASE_URL}/admin/artworks/${id}/download?token=${token}`, '_blank');
  },

  // 批量下载作品
  batchDownload: async (artworkIds: string[]) => {
    const token = getToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/artworks/batch-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkIds })
      });

      if (!response.ok) {
        const data = await readResponseData(response);
        handleAuthExpired(response, data);
        return {
          success: false,
          error: isAuthExpired(response, data)
            ? '登录已失效，请重新登录'
            : getResponseError(data) || `下载失败（${response.status}）`
        };
      }

      // 处理文件下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artworks_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    } catch (error) {
      console.error('批量下载错误:', error);
      return {
        success: false,
        error: '网络错误，请检查连接'
      };
    }
  },

  // 获取统计数据
  getStats: async () => {
    return request<{
      totalWorks: number;
      totalStudents: number;
      typeStats: {
        image: number;
        video: number;
        html: number;
      };
    }>('/admin/artworks/stats');
  }
};

export default {
  auth: authApi,
  artwork: artworkApi,
  admin: adminApi,
  setToken,
  clearToken,
  getToken
};

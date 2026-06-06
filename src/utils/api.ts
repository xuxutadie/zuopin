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

// API响应类型
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function readResponseData(response: Response): Promise<any> {
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

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...options.headers
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await readResponseData(response);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || `请求失败（${response.status}）`
      };
    }

    return {
      success: true,
      data
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
      body: JSON.stringify({ name, role, password })
    });
  }
};

// 作品API
export const artworkApi = {
  // 提交作品
  submit: async (formData: FormData): Promise<ApiResponse> => {
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
        return {
          success: false,
          error: data?.error || `提交失败（${response.status}）`
        };
      }

      return {
        success: true,
        data
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
      artworks: any[];
    }>('/artworks/my');
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
      artworks: any[];
    }>(`/admin/artworks${query ? `?${query}` : ''}`);
  },

  // 老师删除作品
  deleteArtwork: async (id: string) => {
    return request(`/admin/artworks/${id}`, {
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
        return {
          success: false,
          error: data?.error || `下载失败（${response.status}）`
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

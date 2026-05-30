import { User, Artwork } from '../types';

// LocalStorage键名
const STORAGE_KEYS = {
  USERS: 'artwork_users',
  ARTWORKS: 'artwork_artworks',
  CURRENT_USER: 'artwork_current_user',
  TEACHER_PASSWORD: 'artwork_teacher_password'
} as const;

// 默认老师密码
const DEFAULT_TEACHER_PASSWORD = 'admin123';

// 初始化老师账号
export function initializeTeacherAccount(): void {
  const users = getUsers();
  const teacherExists = users.find(u => u.role === 'teacher');
  
  if (!teacherExists) {
    const teacher: User = {
      id: 'teacher_admin',
      name: 'admin',
      role: 'teacher',
      createdAt: Date.now()
    };
    users.push(teacher);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.TEACHER_PASSWORD, DEFAULT_TEACHER_PASSWORD);
  }
}

// 获取用户列表
export function getUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

// 保存用户列表
export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// 获取作品列表
export function getArtworks(): Artwork[] {
  const data = localStorage.getItem(STORAGE_KEYS.ARTWORKS);
  return data ? JSON.parse(data) : [];
}

// 保存作品列表
export function saveArtworks(artworks: Artwork[]): void {
  localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));
}

// 获取当前用户
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

// 设置当前用户
export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// 获取老师密码
export function getTeacherPassword(): string {
  const password = localStorage.getItem(STORAGE_KEYS.TEACHER_PASSWORD);
  return password || DEFAULT_TEACHER_PASSWORD;
}

// 验证老师密码
export function verifyTeacherPassword(password: string): boolean {
  return password === getTeacherPassword();
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

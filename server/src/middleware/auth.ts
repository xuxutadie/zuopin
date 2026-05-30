import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// JWT载荷类型定义
export interface TokenPayload {
  id: string;
  name: string;
  role: 'student' | 'teacher';
}

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// 生成JWT Token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // 7天过期
  });
}

// 验证JWT Token中间件
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: '请先登录' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token无效或已过期' });
  }
}

// 验证老师权限中间件
export function requireTeacher(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'teacher') {
    res.status(403).json({ error: '只有老师才能执行此操作' });
    return;
  }
  next();
}

// 验证学生权限中间件
export function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: '只有学生才能执行此操作' });
    return;
  }
  next();
}

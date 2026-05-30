import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../middleware/auth';

const router: Router = Router();

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, role, password } = req.body;

    // 参数验证
    if (!name || !role) {
      return res.status(400).json({ error: '请提供姓名和角色' });
    }

    if (role !== 'student') {
      return res.status(400).json({ error: '角色必须是student' });
    }

    // 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE name = $1 AND role = $2',
      [name, role]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: '该姓名已被注册' });
    }

    // 创建新用户（学生不需要密码）
    const result = await pool.query(
      'INSERT INTO users (name, role) VALUES ($1, $2) RETURNING id, name, role, created_at',
      [name, role]
    );

    const user = result.rows[0];

    // 生成Token
    const token = generateToken({
      id: user.id,
      name: user.name,
      role: user.role
    });

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误，请重试' });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { name, role, password } = req.body;

    // 参数验证
    if (!name || !role) {
      return res.status(400).json({ error: '请提供姓名和角色' });
    }

    // 查找用户
    const result = await pool.query(
      'SELECT id, name, role, password FROM users WHERE name = $1 AND role = $2',
      [name, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const user = result.rows[0];

    // 老师需要验证密码
    if (role === 'teacher') {
      if (!password) {
        return res.status(400).json({ error: '请提供密码' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: '密码错误' });
      }
    }

    // 生成Token
    const token = generateToken({
      id: user.id,
      name: user.name,
      role: user.role
    });

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误，请重试' });
  }
});

export default router;

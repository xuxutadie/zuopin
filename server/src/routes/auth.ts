import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../middleware/auth';

const router: Router = Router();

// 学生注册。兼容旧数据：旧学生账号没有密码时，允许用注册流程补设密码。
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, role, password } = req.body;

    if (!name || !role || !password) {
      return res.status(400).json({ error: '请提供姓名、角色和密码' });
    }

    if (role !== 'student') {
      return res.status(400).json({ error: '角色必须是 student' });
    }

    const existingUser = await pool.query(
      'SELECT id, name, role, password FROM users WHERE name = $1 AND role = $2',
      [name, role]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];

      if (existing.password) {
        return res.status(409).json({ error: '该姓名已注册，请直接登录' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, existing.id]
      );

      const token = generateToken({
        id: existing.id,
        name: existing.name,
        role: existing.role
      });

      return res.status(200).json({
        message: '密码设置成功',
        user: {
          id: existing.id,
          name: existing.name,
          role: existing.role
        },
        token
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, role, password) VALUES ($1, $2, $3) RETURNING id, name, role, created_at',
      [name, role, hashedPassword]
    );

    const user = result.rows[0];
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

// 用户登录。学生和老师都必须使用密码。
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { name, role, password } = req.body;

    if (!name || !role || !password) {
      return res.status(400).json({ error: '请提供姓名、角色和密码' });
    }

    const result = await pool.query(
      'SELECT id, name, role, password FROM users WHERE name = $1 AND role = $2',
      [name, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(401).json({ error: '该账号还没有设置密码，请先注册设置密码' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '密码错误' });
    }

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

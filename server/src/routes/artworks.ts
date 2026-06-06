import { Router, Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { ensureUploadDir, resolveUploadPath } from '../config/storage';
import { authenticateToken, requireStudent } from '../middleware/auth';
import {
  validateFileType,
  validateFileSize,
  getFileExtension
} from '../utils/fileHelper';

const router = Router();
const uploadDir = ensureUploadDir();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${getFileExtension(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 最大50MB
  }
});

// 提交作品
router.post(
  '/',
  authenticateToken,
  requireStudent,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '请上传文件' });
      }

      const { title, description, type } = req.body;
      const file = req.file;

      // 参数验证
      if (!title || !type) {
        // 删除已上传的文件
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: '请提供作品名称和类型' });
      }

      // 验证作品类型
      if (!['image', 'video', 'html'].includes(type)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: '无效的作品类型' });
      }

      // 验证文件类型
      if (!validateFileType(file.mimetype, file.originalname, type)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: '文件类型不匹配' });
      }

      // 验证文件大小
      if (!validateFileSize(file.size, type)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: '文件大小超过限制' });
      }

      // 保存到数据库
      const result = await pool.query(
        `INSERT INTO artworks 
         (student_id, student_name, title, description, type, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          req.user!.id,
          req.user!.name,
          title,
          description || '',
          type,
          file.originalname,
          file.filename,
          file.size,
          file.mimetype
        ]
      );

      const artwork = result.rows[0];

      res.status(201).json({
        message: '作品提交成功',
        artwork: {
          id: artwork.id,
          studentName: artwork.student_name,
          title: artwork.title,
          description: artwork.description,
          type: artwork.type,
          fileName: artwork.file_name,
          fileSize: artwork.file_size,
          mimeType: artwork.mime_type,
          createdAt: artwork.created_at
        }
      });
    } catch (error) {
      console.error('上传作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 获取我的作品列表
router.get(
  '/my',
  authenticateToken,
  requireStudent,
  async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT * FROM artworks 
         WHERE student_id = $1 
         ORDER BY created_at DESC`,
        [req.user!.id]
      );

      const artworks = result.rows.map(artwork => ({
        id: artwork.id,
        studentName: artwork.student_name,
        title: artwork.title,
        description: artwork.description,
        type: artwork.type,
        fileName: artwork.file_name,
        filePath: artwork.file_path,
        fileSize: artwork.file_size,
        mimeType: artwork.mime_type,
        createdAt: artwork.created_at
      }));

      res.json({ artworks });
    } catch (error) {
      console.error('获取作品列表错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 删除我的作品
router.delete(
  '/:id',
  authenticateToken,
  requireStudent,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // 检查作品是否存在且属于当前用户
      const checkResult = await pool.query(
        'SELECT file_path FROM artworks WHERE id = $1 AND student_id = $2',
        [id, req.user!.id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: '作品不存在或无权删除' });
      }

      const filePath = checkResult.rows[0].file_path;

      // 从数据库删除
      await pool.query('DELETE FROM artworks WHERE id = $1', [id]);

      // 删除文件
      const fullPath = resolveUploadPath(filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      res.json({ message: '作品删除成功' });
    } catch (error) {
      console.error('删除作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

export default router;

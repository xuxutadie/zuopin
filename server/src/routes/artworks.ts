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

interface ArtworkRow {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  description: string | null;
  type: 'image' | 'video' | 'html';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  thumbnail_path: string | null;
  is_public: boolean;
  created_at: string | Date;
}

// 配置文件上传（同时接收作品文件 file 和可选的缩略图 thumbnail）
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

// 判断文件是否为图片（用于缩略图校验）
function isImageMime(mimeType: string, fileName: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) {
    return true;
  }
  const lowerName = fileName.toLowerCase();
  return /\.(png|jpg|jpeg|gif|webp|bmp)$/.test(lowerName);
}

// 提交作品
router.post(
  '/',
  authenticateToken,
  requireStudent,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const file = files?.['file']?.[0];

      if (!file) {
        res.status(400).json({ error: '请上传文件' });
        return;
      }

      const { title, description, type, is_public } = req.body;

      // 参数验证
      if (!title || !type) {
        fs.unlinkSync(file.path);
        if (files?.['thumbnail']?.[0]) {
          try { fs.unlinkSync(files['thumbnail'][0].path); } catch { /* noop */ }
        }
        res.status(400).json({ error: '请提供作品名称和类型' });
        return;
      }

      // 验证作品类型
      if (!['image', 'video', 'html'].includes(type)) {
        fs.unlinkSync(file.path);
        res.status(400).json({ error: '无效的作品类型' });
        return;
      }

      // 验证文件类型
      if (!validateFileType(file.mimetype, file.originalname, type)) {
        fs.unlinkSync(file.path);
        res.status(400).json({ error: '文件类型不匹配' });
        return;
      }

      // 验证文件大小
      if (!validateFileSize(file.size, type)) {
        fs.unlinkSync(file.path);
        res.status(400).json({ error: '文件大小超过限制' });
        return;
      }

      // 处理缩略图文件（可选上传）
      let thumbnailPath: string | null = null;
      const thumbFile = files?.['thumbnail']?.[0];
      if (thumbFile) {
        // 校验缩略图必须是图片
        if (!isImageMime(thumbFile.mimetype, thumbFile.originalname)) {
          fs.unlinkSync(file.path);
          fs.unlinkSync(thumbFile.path);
          res.status(400).json({ error: '封面图必须是图片格式（PNG/JPG/GIF/WebP）' });
          return;
        }
        thumbnailPath = thumbFile.filename;
      }

      // 如果是 image 类型且没上传自定义缩略图，直接用作品文件本身作为缩略图
      if (!thumbnailPath && type === 'image') {
        thumbnailPath = file.filename;
      }

      // 解析是否公开（支持字符串 "true" / "false" 或布尔值）
      const isPublicRaw = typeof is_public === 'string' ? is_public.trim().toLowerCase() : String(!!is_public);
      const isPublic = isPublicRaw === 'true' || isPublicRaw === '1';

      // 保存到数据库
      const result = await pool.query(
        `INSERT INTO artworks 
         (student_id, student_name, title, description, type, file_name, file_path, file_size, mime_type, thumbnail_path, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          file.mimetype,
          thumbnailPath,
          isPublic
        ]
      );

      const artwork = result.rows[0];

      res.status(201).json({
        message: '作品提交成功',
        artwork: {
          id: artwork.id,
          studentId: artwork.student_id,
          studentName: artwork.student_name,
          title: artwork.title,
          description: artwork.description,
          type: artwork.type,
          fileName: artwork.file_name,
          filePath: artwork.file_path,
          fileSize: artwork.file_size,
          mimeType: artwork.mime_type,
          thumbnailPath: artwork.thumbnail_path,
          isPublic: !!artwork.is_public,
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT * FROM artworks 
         WHERE student_id = $1 
         ORDER BY created_at DESC`,
        [req.user!.id]
      );

      const artworks = result.rows.map(artwork => ({
        id: artwork.id,
        studentId: artwork.student_id,
        studentName: artwork.student_name,
        title: artwork.title,
        description: artwork.description,
        type: artwork.type,
        fileName: artwork.file_name,
        filePath: artwork.file_path,
        fileSize: artwork.file_size,
        mimeType: artwork.mime_type,
        thumbnailPath: artwork.thumbnail_path,
        isPublic: !!artwork.is_public,
        createdAt: artwork.created_at
      }));

      res.json({ artworks });
    } catch (error) {
      console.error('获取作品列表错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 公开作品广场列表（无需登录）
router.get(
  '/public',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, search } = req.query;
      const typeValue = typeof type === 'string' ? type : '';

      let query = 'SELECT * FROM artworks WHERE is_public = TRUE';
      const params: string[] = [];
      let paramIndex = 1;

      // 按类型筛选
      if (['image', 'video', 'html'].includes(typeValue)) {
        query += ` AND type = $${paramIndex}`;
        params.push(typeValue);
        paramIndex++;
      }

      // 按关键词搜索
      if (search && typeof search === 'string' && search.trim().length > 0) {
        query += ` AND (title ILIKE $${paramIndex} OR student_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC LIMIT 200';

      const result = await pool.query<ArtworkRow>(query, params);

      const artworks = result.rows.map((artwork) => ({
        id: artwork.id,
        studentId: artwork.student_id,
        studentName: artwork.student_name,
        title: artwork.title,
        description: artwork.description,
        type: artwork.type,
        fileName: artwork.file_name,
        filePath: artwork.file_path,
        fileSize: artwork.file_size,
        mimeType: artwork.mime_type,
        thumbnailPath: artwork.thumbnail_path,
        isPublic: !!artwork.is_public,
        createdAt: artwork.created_at
      }));

      res.json({ artworks });
    } catch (error) {
      console.error('获取作品广场错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 删除我的作品
router.delete(
  '/:id',
  authenticateToken,
  requireStudent,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // 检查作品是否存在且属于当前用户
      const checkResult = await pool.query(
        'SELECT file_path, thumbnail_path FROM artworks WHERE id = $1 AND student_id = $2',
        [id, req.user!.id]
      );

      if (checkResult.rows.length === 0) {
        res.status(404).json({ error: '作品不存在或无权删除' });
        return;
      }

      const row = checkResult.rows[0];
      const filePath = row.file_path;
      const thumbPath = row.thumbnail_path;

      // 从数据库删除
      await pool.query('DELETE FROM artworks WHERE id = $1', [id]);

      // 删除作品文件
      const fullPath = resolveUploadPath(filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      // 删除缩略图文件（缩略图与作品文件不同时才删）
      if (thumbPath && thumbPath !== filePath) {
        const fullThumbPath = resolveUploadPath(thumbPath);
        if (fs.existsSync(fullThumbPath)) {
          try { fs.unlinkSync(fullThumbPath); } catch { /* noop */ }
        }
      }

      res.json({ message: '作品删除成功' });
    } catch (error) {
      console.error('删除作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

export default router;

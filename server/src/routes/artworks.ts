import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import AdmZip from 'adm-zip';
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
  type: 'image' | 'video' | 'html' | 'homepage';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  thumbnail_path: string | null;
  html_entry_path: string | null;
  is_public: boolean;
  created_at: string | Date;
}

const HTML_PROJECT_ROOT = 'html-projects';
const MAX_HTML_PROJECT_FILES = 300;
const MAX_HTML_PROJECT_SIZE = 100 * 1024 * 1024;
const MAX_HOMEPAGE_PROJECT_SIZE = 200 * 1024 * 1024;

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
    // 个人主页 ZIP 最大 100MB，具体类型限制在上传后继续校验。
    fileSize: 100 * 1024 * 1024
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

function isZipFile(file: Express.Multer.File): boolean {
  return file.originalname.toLowerCase().endsWith('.zip')
    || file.mimetype === 'application/zip'
    || file.mimetype === 'application/x-zip-compressed';
}

function safeDeleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch { /* 文件清理失败不影响主流程 */ }
  }
}

function safeDeleteDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    try { fs.rmSync(dirPath, { recursive: true, force: true }); } catch { /* 文件清理失败不影响主流程 */ }
  }
}

function normalizeZipEntryName(entryName: string): string {
  return entryName.replace(/\\/g, '/').replace(/^\/+/, '');
}

function validateZipEntryName(entryName: string): boolean {
  const normalized = normalizeZipEntryName(entryName);
  return Boolean(normalized)
    && !normalized.includes('..')
    && !path.isAbsolute(normalized);
}

function findHtmlEntry(entries: AdmZip.IZipEntry[]): string | null {
  const fileNames = entries
    .filter(entry => !entry.isDirectory)
    .map(entry => normalizeZipEntryName(entry.entryName))
    .filter(name => name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm'));

  if (fileNames.length === 0) {
    return null;
  }

  const indexFile = fileNames
    .filter(name => path.posix.basename(name).toLowerCase() === 'index.html')
    .sort((a, b) => a.split('/').length - b.split('/').length)[0];

  return indexFile || fileNames.sort((a, b) => a.split('/').length - b.split('/').length)[0];
}

function getHtmlProjectDir(htmlEntryPath: string | null): string | null {
  if (!htmlEntryPath?.startsWith(`${HTML_PROJECT_ROOT}/`)) {
    return null;
  }

  const [, projectId] = htmlEntryPath.split('/');
  if (!projectId) {
    return null;
  }

  return resolveUploadPath(`${HTML_PROJECT_ROOT}/${projectId}`);
}

function extractHtmlProject(
  file: Express.Multer.File,
  projectId: string,
  maxProjectSize: number
): string {
  const zip = new AdmZip(file.path);
  const entries = zip.getEntries();
  const files = entries.filter(entry => !entry.isDirectory);

  if (files.length === 0) {
    throw new Error('ZIP 中没有可用文件');
  }

  if (files.length > MAX_HTML_PROJECT_FILES) {
    throw new Error(`ZIP 文件数量不能超过 ${MAX_HTML_PROJECT_FILES} 个`);
  }

  let totalSize = 0;
  for (const entry of files) {
    if (!validateZipEntryName(entry.entryName)) {
      throw new Error('ZIP 中包含不安全的文件路径');
    }
    totalSize += entry.header.size;
  }

  if (totalSize > maxProjectSize) {
    const maxSizeMb = Math.floor(maxProjectSize / (1024 * 1024));
    throw new Error(`ZIP 解压后文件总大小不能超过 ${maxSizeMb}MB`);
  }

  const entryName = findHtmlEntry(entries);
  if (!entryName) {
    throw new Error('ZIP 中没有找到 index.html 或其他 HTML 入口文件');
  }

  const projectRelativeDir = `${HTML_PROJECT_ROOT}/${projectId}`;
  const projectDir = resolveUploadPath(projectRelativeDir);
  fs.mkdirSync(projectDir, { recursive: true });

  for (const entry of files) {
    const normalizedName = normalizeZipEntryName(entry.entryName);
    const outputPath = path.resolve(projectDir, normalizedName);

    if (!outputPath.startsWith(projectDir)) {
      throw new Error('ZIP 中包含不安全的文件路径');
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, entry.getData());
  }

  return `${projectRelativeDir}/${entryName}`;
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
      if (!['image', 'video', 'html', 'homepage'].includes(type)) {
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

      // 网页作品入口：单个 HTML 文件直接访问；ZIP 静态网站先解压并寻找入口文件。
      let htmlEntryPath: string | null = null;
      let htmlProjectDir: string | null = null;
      if (type === 'html' || type === 'homepage') {
        if (isZipFile(file)) {
          const projectId = uuidv4();
          htmlProjectDir = resolveUploadPath(`${HTML_PROJECT_ROOT}/${projectId}`);
          try {
            const maxProjectSize = type === 'homepage'
              ? MAX_HOMEPAGE_PROJECT_SIZE
              : MAX_HTML_PROJECT_SIZE;
            htmlEntryPath = extractHtmlProject(file, projectId, maxProjectSize);
          } catch (error) {
            fs.unlinkSync(file.path);
            if (thumbFile) {
              safeDeleteFile(thumbFile.path);
            }
            if (htmlProjectDir) {
              safeDeleteDirectory(htmlProjectDir);
            }

            res.status(400).json({
              error: error instanceof Error ? error.message : '静态网站 ZIP 解析失败'
            });
            return;
          }
        } else {
          htmlEntryPath = file.filename;
        }
      }

      // 解析是否公开（支持字符串 "true" / "false" 或布尔值）
      const isPublicRaw = typeof is_public === 'string' ? is_public.trim().toLowerCase() : String(!!is_public);
      const isPublic = isPublicRaw === 'true' || isPublicRaw === '1';

      // 保存到数据库
      const result = await pool.query(
        `INSERT INTO artworks 
         (student_id, student_name, title, description, type, file_name, file_path, file_size, mime_type, thumbnail_path, html_entry_path, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
          htmlEntryPath,
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
          htmlEntryPath: artwork.html_entry_path,
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
        htmlEntryPath: artwork.html_entry_path,
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
      if (['image', 'video', 'html', 'homepage'].includes(typeValue)) {
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
        htmlEntryPath: artwork.html_entry_path,
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
        'SELECT file_path, thumbnail_path, html_entry_path FROM artworks WHERE id = $1 AND student_id = $2',
        [id, req.user!.id]
      );

      if (checkResult.rows.length === 0) {
        res.status(404).json({ error: '作品不存在或无权删除' });
        return;
      }

      const row = checkResult.rows[0];
      const filePath = row.file_path;
      const thumbPath = row.thumbnail_path;
      const htmlEntryPath = row.html_entry_path;

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

      const htmlProjectDir = getHtmlProjectDir(htmlEntryPath);
      if (htmlProjectDir) {
        safeDeleteDirectory(htmlProjectDir);
      }

      res.json({ message: '作品删除成功' });
    } catch (error) {
      console.error('删除作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import pool from '../config/database';
import { resolveUploadPath } from '../config/storage';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const router = Router();

interface StudentArtworkFile {
  file_path: string;
  thumbnail_path: string | null;
  html_entry_path: string | null;
}

const HTML_PROJECT_ROOT = 'html-projects';

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

function getHtmlProjectDir(htmlEntryPath: string | null): string | null {
  if (!htmlEntryPath?.startsWith(`${HTML_PROJECT_ROOT}/`)) {
    return null;
  }

  const [, projectId] = htmlEntryPath.split('/');
  if (!projectId) {
    return null;
  }

  return resolveUploadPath(path.posix.join(HTML_PROJECT_ROOT, projectId));
}

// 获取所有作品列表
router.get(
  '/',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, search } = req.query;
      const typeValue = typeof type === 'string' ? type : '';
      const searchValue = typeof search === 'string' ? search.trim() : '';

      let query = 'SELECT * FROM artworks WHERE 1=1';
      const params: string[] = [];
      let paramIndex = 1;

      // 按类型筛选
      if (['image', 'video', 'html'].includes(typeValue)) {
        query += ` AND type = $${paramIndex}`;
        params.push(typeValue);
        paramIndex++;
      }

      // 按关键词搜索
      if (searchValue) {
        query += ` AND (title ILIKE $${paramIndex} OR student_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${searchValue}%`);
        paramIndex++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);

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

// 获取注册学生明细
router.get(
  '/students',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query(`
        SELECT
          users.id,
          users.name,
          users.created_at,
          COUNT(artworks.id)::int AS work_count,
          COUNT(artworks.id) FILTER (WHERE artworks.is_public = TRUE)::int AS public_work_count,
          COUNT(artworks.id) FILTER (WHERE artworks.type = 'image')::int AS image_count,
          COUNT(artworks.id) FILTER (WHERE artworks.type = 'video')::int AS video_count,
          COUNT(artworks.id) FILTER (WHERE artworks.type = 'html')::int AS html_count,
          MAX(artworks.created_at) AS last_submitted_at
        FROM users
        LEFT JOIN artworks ON artworks.student_id = users.id
        WHERE users.role = 'student'
        GROUP BY users.id, users.name, users.created_at
        ORDER BY users.created_at DESC
      `);

      const students = result.rows.map(student => ({
        id: student.id,
        name: student.name,
        createdAt: student.created_at,
        workCount: Number(student.work_count || 0),
        publicWorkCount: Number(student.public_work_count || 0),
        imageCount: Number(student.image_count || 0),
        videoCount: Number(student.video_count || 0),
        htmlCount: Number(student.html_count || 0),
        lastSubmittedAt: student.last_submitted_at
      }));

      res.json({ students });
    } catch (error) {
      console.error('获取学生明细错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 下载单个作品
router.get(
  '/:id/download',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM artworks WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: '作品不存在' });
        return;
      }

      const artwork = result.rows[0];
      const filePath = resolveUploadPath(artwork.file_path);

      res.download(filePath, artwork.file_name);
    } catch (error) {
      console.error('下载作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 批量下载作品
router.post(
  '/batch-download',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { artworkIds } = req.body;

      if (!artworkIds || !Array.isArray(artworkIds) || artworkIds.length === 0) {
        res.status(400).json({ error: '请选择要下载的作品' });
        return;
      }

      // 获取作品信息
      const result = await pool.query(
        'SELECT * FROM artworks WHERE id = ANY($1)',
        [artworkIds]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: '没有找到对应的作品' });
        return;
      }

      const artworks = result.rows;

      // 创建ZIP压缩包
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      res.attachment(`artworks_${Date.now()}.zip`);
      archive.pipe(res);

      // 添加文件到压缩包
      for (const artwork of artworks) {
        const filePath = resolveUploadPath(artwork.file_path);
        archive.file(filePath, { name: `${artwork.student_name}/${artwork.file_name}` });
      }

      archive.finalize();
    } catch (error) {
      console.error('批量下载错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 老师设置作品是否展示在作品广场
router.patch(
  '/:id/public',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isPublic } = req.body;

      if (typeof isPublic !== 'boolean') {
        res.status(400).json({ error: '请提供正确的公开状态' });
        return;
      }

      const result = await pool.query(
        `UPDATE artworks
         SET is_public = $1
         WHERE id = $2
         RETURNING *`,
        [isPublic, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: '作品不存在' });
        return;
      }

      const artwork = result.rows[0];
      res.json({
        message: isPublic ? '作品已推送到作品广场' : '作品已从作品广场取消展示',
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
      console.error('设置作品公开状态错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 老师删除注册学生，同时删除该学生提交的作品文件
router.delete(
  '/students/:id',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const studentResult = await pool.query(
        `SELECT id, name FROM users WHERE id = $1 AND role = 'student'`,
        [id]
      );

      if (studentResult.rows.length === 0) {
        res.status(404).json({ error: '学生不存在' });
        return;
      }

      const artworkResult = await pool.query<StudentArtworkFile>(
        'SELECT file_path, thumbnail_path, html_entry_path FROM artworks WHERE student_id = $1',
        [id]
      );

      await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'student']);

      // 数据库通过外键级联删除作品记录，这里负责清理实际上传文件。
      for (const artwork of artworkResult.rows) {
        const filePath = resolveUploadPath(artwork.file_path);
        safeDeleteFile(filePath);

        if (artwork.thumbnail_path && artwork.thumbnail_path !== artwork.file_path) {
          const thumbnailPath = resolveUploadPath(artwork.thumbnail_path);
          safeDeleteFile(thumbnailPath);
        }

        const htmlProjectDir = getHtmlProjectDir(artwork.html_entry_path);
        if (htmlProjectDir) {
          safeDeleteDirectory(htmlProjectDir);
        }
      }

      res.json({
        message: '学生账号及其作品已删除',
        student: {
          id: studentResult.rows[0].id,
          name: studentResult.rows[0].name
        }
      });
    } catch (error) {
      console.error('删除学生错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 老师删除作品
router.delete(
  '/:id',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT file_path, thumbnail_path, html_entry_path FROM artworks WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: '作品不存在' });
        return;
      }

      const artwork = result.rows[0];
      const filePath = resolveUploadPath(artwork.file_path);

      await pool.query('DELETE FROM artworks WHERE id = $1', [id]);

      safeDeleteFile(filePath);

      if (artwork.thumbnail_path && artwork.thumbnail_path !== artwork.file_path) {
        safeDeleteFile(resolveUploadPath(artwork.thumbnail_path));
      }

      const htmlProjectDir = getHtmlProjectDir(artwork.html_entry_path);
      if (htmlProjectDir) {
        safeDeleteDirectory(htmlProjectDir);
      }

      res.json({ message: '作品删除成功' });
    } catch (error) {
      console.error('老师删除作品错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

// 获取统计数据
router.get(
  '/stats',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 获取作品总数
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM artworks');
      const totalWorks = parseInt(totalResult.rows[0].total);

      // 获取学生总数
      const studentsResult = await pool.query(
        'SELECT COUNT(DISTINCT student_id) as total FROM artworks'
      );
      const totalStudents = parseInt(studentsResult.rows[0].total);

      // 按类型统计
      const typeResult = await pool.query(`
        SELECT type, COUNT(*) as count 
        FROM artworks 
        GROUP BY type
      `);

      const typeStats = {
        image: 0,
        video: 0,
        html: 0
      };

      typeResult.rows.forEach(row => {
        typeStats[row.type as keyof typeof typeStats] = parseInt(row.count);
      });

      res.json({
        totalWorks,
        totalStudents,
        typeStats
      });
    } catch (error) {
      console.error('获取统计数据错误:', error);
      res.status(500).json({ error: '服务器错误，请重试' });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import fs from 'fs';
import archiver from 'archiver';
import pool from '../config/database';
import { resolveUploadPath } from '../config/storage';
import { authenticateToken, requireTeacher } from '../middleware/auth';

const router = Router();

// 获取所有作品列表
router.get(
  '/',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, search } = req.query;

      let query = 'SELECT * FROM artworks WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      // 按类型筛选
      if (type && ['image', 'video', 'html'].includes(type as string)) {
        query += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      // 按关键词搜索
      if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR student_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
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

// 老师删除作品
router.delete(
  '/:id',
  authenticateToken,
  requireTeacher,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT file_path FROM artworks WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: '作品不存在' });
        return;
      }

      const filePath = resolveUploadPath(result.rows[0].file_path);

      await pool.query('DELETE FROM artworks WHERE id = $1', [id]);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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

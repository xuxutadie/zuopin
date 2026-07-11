import { Router, Request, Response } from 'express';
import path from 'path';
import { getUploadDir } from '../config/storage';

const router = Router();
const uploadDir = getUploadDir();

// 提供文件访问（用于前端预览）
router.get('*', (req: Request, res: Response): void => {
  try {
    const relativePath = decodeURIComponent(req.path).replace(/^\/+/, '');
    
    // 安全检查：允许静态网站资源的多级路径，但禁止路径遍历和绝对路径。
    if (
      !relativePath ||
      relativePath.includes('..') ||
      path.isAbsolute(relativePath)
    ) {
      res.status(400).json({ error: '无效的文件名' });
      return;
    }

    const filePath = path.resolve(uploadDir, relativePath);
    if (!filePath.startsWith(uploadDir)) {
      res.status(400).json({ error: '无效的文件路径' });
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('文件访问错误:', error);
    res.status(404).json({ error: '文件不存在' });
  }
});

export default router;

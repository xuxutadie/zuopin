import { Router, Request, Response } from 'express';
import { resolveUploadPath } from '../config/storage';

const router = Router();

// 提供文件访问（用于前端预览）
router.get('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // 安全检查：确保文件名不包含路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: '无效的文件名' });
    }

    const filePath = resolveUploadPath(filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error('文件访问错误:', error);
    res.status(404).json({ error: '文件不存在' });
  }
});

export default router;

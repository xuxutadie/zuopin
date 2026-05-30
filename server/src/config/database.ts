import { Pool } from 'pg';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ 成功连接到PostgreSQL数据库');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
  process.exit(-1);
});

// 初始化数据库表结构
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  
  try {
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, role)
      )
    `);
    console.log('✅ 用户表创建成功');

    // 创建作品表
    await client.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        student_name VARCHAR(100) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'html')),
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        thumbnail_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 作品表创建成功');

    // 创建老师账号
    const teacherPassword = process.env.TEACHER_PASSWORD || 'admin123';
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);

    await client.query(`
      INSERT INTO users (name, role, password)
      VALUES ('admin', 'teacher', $1)
      ON CONFLICT (name, role) DO UPDATE SET password = $1
    `, [hashedPassword]);
    console.log('✅ 老师账号创建成功');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;

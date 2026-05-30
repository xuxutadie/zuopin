# AI作品收集平台 - Zeabur部署指南

## 📋 部署概述

本项目采用前后端分离架构：
- **前端**：React + TypeScript + Vite（静态网站）
- **后端**：Node.js + Express + TypeScript
- **数据库**：PostgreSQL（Zeabur一键部署）

---

## 🚀 部署步骤

### 第一步：准备Zeabur环境

1. **注册Zeabur账号**
   - 访问 [zeabur.com](https://zeabur.com)
   - 使用GitHub账号登录（推荐）

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Create a new project"
   - 输入项目名称：`artwork-collector`

### 第二步：创建PostgreSQL数据库

1. **在项目中添加数据库**
   - 点击 "Add Service"
   - 选择 "Marketplace"
   - 选择 "PostgreSQL"
   - 点击 "Deploy"

2. **配置数据库**
   - 等待数据库部署完成（约1-2分钟）
   - 点击数据库服务
   - 复制 **Connection URL**（格式：`postgres://用户名:密码@主机:端口/数据库名`）

### 第三步：部署后端服务

1. **创建GitHub仓库**
   - 在GitHub创建新仓库：`artwork-collector-server`
   - 将 `server/` 目录下的所有文件推送到仓库

2. **在Zeabur中部署后端**
   - 点击 "Add Service"
   - 选择 "Git"
   - 连接你的GitHub仓库
   - 选择 `main` 分支

3. **配置环境变量**
   - 在服务设置中找到 "Environment Variables"
   - 添加以下变量：
   
   ```
   DATABASE_URL=postgres://用户名:密码@主机:端口/数据库名
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=production
   TEACHER_PASSWORD=admin123
   PORT=3000
   ```

4. **等待部署完成**
   - Zeabur会自动安装依赖并构建
   - 部署完成后，复制后端服务的 **域名**（格式：`xxx.zeabur.app`）

### 第四步：部署前端网站

1. **创建前端GitHub仓库**
   - 在GitHub创建新仓库：`artwork-collector`
   - 将项目根目录（除 `server/` 外）推送到仓库

2. **在Zeabur中部署前端**
   - 点击 "Add Service"
   - 选择 "Git"
   - 连接你的GitHub仓库

3. **配置环境变量**
   - 添加：
   
   ```
   VITE_API_URL=https://你的后端域名/api
   ```

4. **配置静态网站**
   - 在服务设置中，将 Build Command 设置为：
     ```
     npm run build
     ```
   - 将 Output Directory 设置为：
     ```
     dist
     ```

5. **配置路由**
   - 添加环境变量：
     ```
     SERVER_PORT=3000
     ```

6. **等待部署完成**
   - 复制前端的 **域名**（格式：`yyy.zeabur.app`）

### 第五步：更新CORS配置

1. **更新后端CORS设置**
   - 在Zeabur中编辑后端服务
   - 修改环境变量 `FRONTEND_URL` 为你的前端域名：
     ```
     FRONTEND_URL=https://你的前端域名.zeabur.app
     ```
   - 重新部署后端

---

## ✅ 验证部署

### 测试网站访问
1. 访问你的前端域名（`https://前端域名.zeabur.app`）
2. 页面应该正常加载

### 测试功能
1. **学生注册**
   - 选择"我是学生"
   - 输入姓名注册
   - 应显示注册成功

2. **作品上传**
   - 登录后进入控制台
   - 点击"提交新作品"
   - 上传一个图片文件
   - 应显示上传成功

3. **老师登录**
   - 退出登录
   - 选择"我是老师"
   - 输入账号 `admin`，密码 `admin123`
   - 应登录成功

4. **作品管理**
   - 进入"作品总览"
   - 应能看到学生提交的作品
   - 测试下载功能

---

## 🔧 配置说明

### 环境变量详解

#### 后端环境变量
| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | PostgreSQL连接字符串 | `postgres://user:pass@host:5432/db` |
| JWT_SECRET | JWT加密密钥（请修改） | `your-secret-key` |
| NODE_ENV | 运行环境 | `production` |
| TEACHER_PASSWORD | 老师账号密码 | `admin123` |
| PORT | 服务端口 | `3000` |
| FRONTEND_URL | 前端域名（CORS配置） | `https://app.zeabur.app` |

#### 前端环境变量
| 变量名 | 说明 | 示例 |
|--------|------|------|
| VITE_API_URL | 后端API地址 | `https://api.zeabur.app/api` |

### 老师账号
- **账号**：`admin`
- **密码**：`admin123`（可在环境变量中修改）

---

## 🐛 常见问题

### 1. 数据库连接失败
**症状**：后端启动时报数据库连接错误
**解决**：
- 检查 `DATABASE_URL` 是否正确
- 确认数据库已完全启动
- 检查数据库用户名密码是否正确

### 2. CORS错误
**症状**：前端调用API时提示跨域错误
**解决**：
- 确认后端 `FRONTEND_URL` 已设置
- 确认设置为完整的URL（包括 `https://`）
- 重新部署后端服务

### 3. 文件上传失败
**症状**：作品上传时显示错误
**解决**：
- 检查 `uploads` 目录是否可写
- 检查文件大小是否超过限制（图片10MB，视频50MB，HTML 20MB）
- 查看后端日志获取详细错误

### 4. 部署构建失败
**症状**：Zeabur构建时失败
**解决**：
- 检查依赖是否完整（`package.json`）
- 检查Node版本（推荐Node 18+）
- 查看构建日志，定位具体错误

---

## 💡 优化建议

### 1. 修改默认密码
首次部署后，请立即修改老师密码：
1. 在Zeabur中修改后端环境变量 `TEACHER_PASSWORD`
2. 重新部署后端

### 2. 使用强JWT密钥
生成随机字符串作为JWT密钥：
```bash
openssl rand -base64 32
```

### 3. 监控和日志
- Zeabur提供内置日志功能
- 定期查看后端日志，及时发现问题

### 4. 数据备份
- Zeabur的PostgreSQL支持自动备份
- 可手动导出重要数据

---

## 📞 技术支持

如遇到问题，可检查：
1. Zeabur官方文档：https://zeabur.com/docs
2. 项目GitHub Issues
3. 查看后端日志定位问题

---

## 🎉 部署完成！

恭喜！现在你的AI作品收集平台已经成功部署到Zeabur。学生和老师可以分别通过不同的浏览器和设备访问和使用系统了！

**访问地址**：
- 前端网站：`https://你的前端域名.zeabur.app`
- 后端API：`https://你的后端域名.zeabur.app/api`

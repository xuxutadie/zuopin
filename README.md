# AI作品收集平台

一个专为青少年AI教育设计的作品收集系统，支持学生提交图片、视频、HTML作品，老师可查看和下载所有作品。

## 🎯 功能特性

### 学生功能
- ✅ 姓名注册/登录（无需密码）
- ✅ 提交图片作品（支持 JPG、PNG、GIF、WebP）
- ✅ 提交视频作品（支持 MP4、WebM）
- ✅ 提交HTML作品（支持 HTML、ZIP）
- ✅ 查看个人作品列表
- ✅ 删除个人作品

### 老师功能
- ✅ 账号密码登录（admin/admin123）
- ✅ 查看所有学生作品
- ✅ 按类型筛选作品
- ✅ 搜索作品名称/学生姓名
- ✅ 单个下载作品
- ✅ 批量下载作品（ZIP打包）

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **后端**：Node.js + Express + TypeScript
- **数据库**：PostgreSQL
- **部署**：Zeabur

## 🚀 快速开始

### 本地开发

1. **安装依赖**
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install
```

2. **启动PostgreSQL数据库**（本地）

3. **配置环境变量**
```bash
# 复制后端环境变量配置
cd server
cp .env.example .env
# 编辑.env文件，填写数据库连接信息
```

4. **启动服务**
```bash
# 启动后端（终端1）
cd server
npm run dev

# 启动前端（终端2）
npm run dev
```

5. **访问网站**
- 前端：http://localhost:5173
- 后端API：http://localhost:3000

### 生产部署

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 项目结构

```
作品收集器/
├── src/                    # 前端源代码
│   ├── components/        # 可复用组件
│   ├── pages/            # 页面组件
│   ├── stores/           # 状态管理
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型定义
├── server/                # 后端源代码
│   ├── src/
│   │   ├── routes/      # API路由
│   │   ├── middleware/  # 中间件
│   │   ├── config/      # 配置
│   │   └── utils/       # 工具函数
│   └── uploads/         # 上传文件存储
├── DEPLOYMENT.md         # 部署指南
└── README.md            # 项目说明
```

## 👥 用户指南

### 学生使用流程
1. 访问网站 → 点击"立即开始"
2. 选择"我是学生" → 输入姓名注册
3. 进入控制台 → 点击"提交新作品"
4. 选择作品类型 → 上传文件 → 填写信息 → 提交

### 老师使用流程
1. 点击"老师登录" → 输入账号密码（admin/admin123）
2. 进入控制台 → 点击"作品总览"
3. 查看所有作品 → 选择作品 → 下载保存

## ⚙️ 配置说明

### 老师账号配置
- **默认账号**：admin
- **默认密码**：admin123
- **修改方式**：在Zeabur环境变量中修改 `TEACHER_PASSWORD`

### 文件上传限制
- 图片：最大 10MB
- 视频：最大 50MB
- HTML：最大 20MB

## 🐛 常见问题

### Q: 学生忘记密码怎么办？
A: 学生账号不需要密码，只需输入姓名即可登录。同一姓名只能注册一次。

### Q: 如何重置老师密码？
A: 在Zeabur控制台修改环境变量 `TEACHER_PASSWORD`，然后重新部署后端。

### Q: 数据存储在哪里？
A: 所有数据存储在PostgreSQL数据库中，文件存储在服务器本地。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过GitHub Issues联系我们。

# Homepage Category Implementation Plan

**Goal:** 新增个人主页分类，并实施 ZIP 100MB、解压后 200MB 的独立限制。

**Architecture:** 在现有作品类型契约中增加 `homepage`，复用 HTML 静态网站解压和预览链路，通过作品类型参数选择不同的上传与解压限制。数据库继续使用现有字符串类型字段。

**Tech Stack:** React、TypeScript、Express、Multer、AdmZip、PostgreSQL

## 实施步骤

- [x] 后端增加 `homepage` 类型、100MB 上传限制和 200MB 解压限制。
- [x] 前端类型、文件校验和 API 类型增加 `homepage`。
- [x] 上传页、卡片、作品广场、作品总览和控制台增加个人主页入口与统计。
- [x] 运行前后端类型检查、Lint 和生产构建。
- [x] 浏览器验证分类入口、筛选布局和现有作品兼容性。
- [x] 审查差异并准备推送 `main`。

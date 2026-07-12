# Artwork Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在作品广场保持桌面端四列的同时扩大作品预览，并将五个常用操作整理为单行图标工具栏。

**Architecture:** 继续复用现有 `ArtworkCard` 组件与全部事件处理函数，只调整组件内部的信息层级和 Tailwind 样式。作品广场保留四列上限并优化断点；不增加状态、依赖、接口或数据字段。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、Lucide React、Vite

---

### Task 1: 重排作品卡片预览与信息区

**Files:**
- Modify: `src/components/ArtworkCard.tsx`

- [ ] **Step 1: 记录当前页面基线**

在 `http://127.0.0.1:5174/gallery` 截图，确认当前预览高度约 192px，公开分享链接占据独立内容块，操作按钮分为两行。

- [ ] **Step 2: 扩大预览并压缩信息区**

将预览容器调整为稳定的 `aspect-[16/10]`，并为卡片增加纵向 flex 结构。标题保持两行上限，描述缩为一行，移除公开分享链接展示块，日期和大小保留在同一行。

- [ ] **Step 3: 检查卡片结构**

Run: `npm run check`

Expected: TypeScript 检查成功，无类型错误。

### Task 2: 合并五个常用操作

**Files:**
- Modify: `src/components/ArtworkCard.tsx`

- [ ] **Step 1: 将常用操作改为单行工具栏**

创建等宽五列工具栏，依次放置预览、下载、复制链接、打开链接和二维码图标按钮。每个按钮增加 `title`、`aria-label` 和屏幕阅读器文本；没有分享链接时将后三个按钮设为禁用状态，以保持每张卡片布局稳定。

- [ ] **Step 2: 保持管理操作独立**

教师公开状态切换继续使用整行文字按钮；删除操作继续作为管理操作显示，但不占用五个日常操作的位置。

- [ ] **Step 3: 检查交互代码**

Run: `npm run check`

Expected: TypeScript 检查成功，原有事件处理函数仍被调用。

### Task 3: 优化广场四列布局与响应式

**Files:**
- Modify: `src/pages/Gallery.tsx`

- [ ] **Step 1: 调整作品网格断点和间距**

保留 `xl:grid-cols-4`，使用较紧凑但清晰的横纵间距；小屏依次回落为单列、双列和三列，避免卡片内容拥挤。

- [ ] **Step 2: 运行静态验证**

Run: `npm run lint`

Expected: ESLint 无新增错误。

Run: `npm run build`

Expected: TypeScript 与 Vite 生产构建成功。

### Task 4: 浏览器验收

**Files:**
- Verify: `src/components/ArtworkCard.tsx`
- Verify: `src/pages/Gallery.tsx`

- [ ] **Step 1: 验证宽屏布局**

在约 1920px 宽的视口打开 `/gallery`，确认一行四张、预览是视觉主体、五个操作同处一行、卡片高度整齐。

- [ ] **Step 2: 验证窄屏布局**

在约 390px 宽的视口打开 `/gallery`，确认卡片单列显示，标题、元信息和操作按钮无重叠或横向溢出。

- [ ] **Step 3: 验证交互与控制台**

分别检查预览、下载、复制链接、打开链接、二维码按钮的可识别性，并确认浏览器控制台没有由本次改动引入的新错误。

- [ ] **Step 4: 检查最终差异**

Run: `git diff --check`

Expected: 无空白错误。

Run: `git status --short`

Expected: 仅出现本次修改的前端文件、设计与计划文档，以及此前已有且不纳入提交的 `dev-frontend.log`。

# 在线视频播放器（ovideo）

基于 **Vite + React + TypeScript + TailwindCSS + shadcn/ui** 全面重构的在线播放器，支持导入本地视频、整目录扫描以及添加在线视频链接，内置播放列表与倍速控制体验。

## 功能特性
- 打开单个或多个本地视频文件，自动加入播放列表
- 导入整 个文件夹（`webkitdirectory`），保留相对路径方便定位
- 通过弹窗添加在线视频 URL（HTTP/HTTPS），与本地文件混排播放
- 播放列表可快速切换条目，并标识当前播放项
- 倍速选择器覆盖 0.5x – 2x，多端一致的播放控制
- UI 组件基于 shadcn/ui + Radix Primitives，自适应明暗主题

## 本地开发
```bash
npm install
npm run dev
```
开发服务器默认运行在 `http://localhost:5173`，支持 HMR。

## 构建发布
```bash
npm run build
```
构建产物输出到 `dist/`，可配合静态托管（如 GitHub Pages、Vercel 等）部署。

## 项目结构摘要
```
src/
  components/
    ui/           # 引入的 shadcn/ui 原子组件
    video-player.tsx
  lib/
    utils.ts      # Tailwind + clsx 辅助方法
```

## 许可证
MIT（保留原项目 License，如需商业使用请根据业务合规调整）

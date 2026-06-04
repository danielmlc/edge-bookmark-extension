<p align="center">
  <img src="logo.png" width="120" alt="Markly" />
</p>

# Markly

> 把浏览器原生书签变成一张美观、可探索的全页网格。

## 简介

Markly 是一款 Edge / Chrome 浏览器扩展，将系统原生书签以卡片网格的形式呈现，支持文件夹逐层进入、全文搜索、主题切换与个性化背景，让书签管理变得清晰而愉快。

## 功能

- **卡片网格** — 书签与文件夹以统一的磁贴样式展示，支持多列自适应布局
- **文件夹导航** — 点击进入子文件夹，面包屑导航随时返回
- **全文搜索** — 实时搜索标题与 URL，键盘方向键选择，Enter 直接打开
- **收藏图标** — 自动获取网站 Favicon；无法获取时以品牌色首字母替代
- **多主题** — 亮色 / 暗色 / 自动，5 套渐变壁纸可选
- **个性化设置** — 强调色、圆角、毛玻璃模糊强度、色调滤镜均可调节
- **多选批量操作** — 批量删除书签
- **快速添加** — 一键将当前标签页添加为书签，或新建文件夹
- **导出** — 将当前文件夹下的书签导出为 HTML

## 安装

1. 克隆或下载本仓库
2. 执行构建（需要 Node.js ≥ 18）：
   ```bash
   npm install
   npm run build
   ```
3. 打开 `edge://extensions`（或 `chrome://extensions`），开启**开发者模式**
4. 点击「加载已解压的扩展程序」，选择本项目根目录

## 目录结构

```
├── bookmarks.html       # 扩展主页面
├── background.js        # Service Worker
├── manifest.json        # 扩展清单
├── js/
│   ├── app.js           # 主应用组件
│   ├── ui.js            # 图标、Favicon、Toast 等 UI 组件
│   ├── settings.js      # 设置面板
│   ├── store.js         # 状态管理（书签 + 用户偏好）
│   └── data.js          # 书签数据工具函数
├── dist/                # esbuild 编译输出（构建后生成）
└── docs/                # 设计文档与 UI 原型
```

## 技术栈

- React 18（UMD，通过 esbuild 本地打包）
- 原生 Chrome Bookmarks API
- CSS 变量 + 毛玻璃（backdrop-filter）
- esbuild 构建

## License

MIT

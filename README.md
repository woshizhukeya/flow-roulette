# 🎯 Flow Roulette (专注任务轮盘)

## 📖 项目简介

Flow Roulette 是一款结合了任务列表、随机抽取（轮盘）与专注计时器的桌面生产力工具。
当您面临多个任务难以抉择或患有“选择困难症”时，可以通过轮盘随机抽取一个任务，并直接进入专注计时模式，帮助您克服拖延，快速进入工作与学习流（Flow）。

本项目基于优秀的前端和桌面应用技术栈构建：

- **前端框架**: React 19 + TypeScript + Vite
- **样式与动画**: Tailwind CSS (v4), Framer Motion, Lucide React (图标)
- **桌面端底层**: Tauri v2 (Rust)

---

![软件界面截图](./assets/screenshot.png)

## ✨ 主要功能

- **✅ 任务管理 (`TaskList` & `TaskInput`)**: 轻松添加、编辑和删除待办事项。
- **🎡 命运轮盘 (`RouletteWheel`)**: 以生动的转盘动画形式，从已有的任务列表中随机抽取下一个专注目标。
- **⏱️ 专注计时器 (`Timer`)**: 抽中任务后可直接进入专注倒计时，为您过滤其他干扰。
- **🎉 完成结算 (`ResultModal`)**: 倒计时结束拥有五彩纸屑撒花特效 (Confetti)，带来任务完成的满满成就感。
- **📱 侧边栏导航 (`Sidebar`)**: 直观优雅的界面布局结构，提供顺畅的操作体验。

---

## 🛠️ 环境准备

在安装和运行项目之前，请确保您的开发环境中已经安装了以下工具：

1. **[Node.js](https://nodejs.org/)** (推荐使用相对较新的 LTS 版本, 用于前端依赖安装和脚本执行)
2. **[Rust & Cargo](https://rustup.rs/)** (用于构建 Tauri 桌面端)
3. **对应的系统构建工具**（如果是在 Windows 上，需安装 C++ 构建工具和 WebView2，具体可参考 [Tauri 官方前置指南](https://v2.tauri.app/start/prerequisites/)）

---

## 📦 如何安装依赖

在项目根目录（`flow-roulette` 文件夹）下打开终端，运行命令即可：

```bash
# 安装前端所需依赖
npm install

# 或者如果你偏好使用 yarn / pnpm / bun:
# yarn install
# pnpm install
```

_(注意：首次启动或构建时，Cargo 也会自动下载对应的 Rust 依赖包，请保持网络通畅。)_

---

## 🚀 如何运行项目

本项目可以单纯作为网页端进行 UI 调试，也可以直接作为桌面端应用运行。

### 1. 网页端模式（用于快速调整 UI）

如果你只希望快速调试 React 组件、样式或前端交互逻辑，可以通过 Vite 的本地服务器启动：

```bash
npm run dev
```

启动后可以在浏览器中访问 `http://localhost:1420/`。

### 2. 桌面端开发模式（Tauri 调试）

如果你希望调试完整的桌面端功能（并在原生桌面独立窗口中运行应用），请运行：

```bash
npm run tauri dev
```

_提示：首次执行此命令可能需要较长的时间下载和编译 Rust 与 Tauri 的底层依赖。_

### 3. 构建发布应用

当您开发完成，准备打包为您当前操作系统的安装包时（如 Windows 的 `.exe` 或 `.msi`），请运行：

```bash
npm run tauri build
```

构建成功后，您的安装程序以及可执行应用包会默认输出在 `src-tauri/target/release/bundle/` 目录中。

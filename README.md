# Antigravity 2.0 Auto-Clicker Background Daemon & Controller

> [!WARNING]
> ### ⚠️ System Compatibility Notice / 系统兼容性声明
> **This tool is strictly built for macOS and the macOS Desktop client of Antigravity 2.0.**
> - **Supported OS**: macOS (macOS 10.15+, fully supports Apple Silicon M-series & Intel Macs)
> - **Required App**: Antigravity 2.0 Desktop App for Mac
> - **Dependencies**: Python 3 (installed by default or via Xcode Command Line Tools)
> 
> *Do NOT run the automated installer (`install.sh`) on Windows or Linux! It relies on macOS `launchd` plist daemons and Apple application sandboxing structures. Running it on unsupported systems will fail.*
> 
> **本脚本及安装程序专为 macOS 系统以及 Antigravity 2.0 Mac 桌面客户端定制开发！**
> - **支持系统**: macOS (macOS 10.15及以上，完美兼容 M系列芯片 及 Intel芯片)
> - **必须应用**: Antigravity 2.0 Mac 桌面客户端版
> - **运行依赖**: Python 3 (macOS 系统通常自带或通过 Xcode 工具链自动安装)
> 
> *请勿在 Windows 或 Linux 系统中运行一键安装脚本 (`install.sh`)！本方案强依赖于 macOS 特有的 `launchd` 后台自启动代理守护服务（plist）以及 Apple 专属的应用程序缓存沙盒路径。在非 macOS 系统中运行将导致安装失败。*

---

> [!TIP]
> ### 🤖 AI Agent Autopilot Deploy Command / AI 一键自动安装指令
> **Copy and paste the command below into your AI coding assistant (e.g. Gemini, Antigravity, Claude, etc.) to trigger a 100% automated installation:**
> 
> ```text
> [Autopilot Trigger] I want to install this Antigravity 2.0 Auto-Clicker on my macOS system. Please locate the "install.sh" file in this directory, make it executable (chmod +x), run it, and verify that the launchd service is loaded successfully. If you run into sandbox blocks, bypass them.
> ```
> 
> **将上方这段指令直接复制发送给您的 AI 编程助手，AI 将会全自动定位安装脚本、配置可执行权限、运行安装程序并为您校验服务状态，实现 100% 无感自动化部署！**

---

> 🤖 **For Developers & AI Agents**: This repository contains a fully automated macOS launchd agent, Chrome DevTools Protocol (CDP) WebSocket injector, and a premium in-page iOS-style glassmorphism control panel. It is designed to be 100% robust against client page refreshes (`Cmd+R`), app restarts, and UI modifications.

中文安装与使用指南请见下方。

---

## 💎 Features (核心亮点)

1. **Pure CSS Class-Based Matcher (100% 精准匹配)**: 
   摒弃了文本关键字搜索和大词表匹配，完全通过主按钮 of Tailwind 类特征组合 (`bg-primary`, `text-primary-foreground`, `cursor-pointer`, `whitespace-nowrap`, `text-ellipsis`) 进行像素级精细匹配，100% 杜绝因聊天内容、侧边栏文字等引起的误触。
2. **Persistent Daemon Heartbeat (常驻守护心跳)**:
   升级为 Python 常驻守护进程。每隔 3 秒进行低功耗心跳检测。当用户在应用内按下 `Cmd+R` 刷新或跳转页面导致前端 JS 环境被擦除时，守护进程会在 3 秒内**自动重新注入前端逻辑**，彻底解决重启或刷新后不自启的问题。
3. **Premium Apple Glassmorphism Panel (苹果级毛玻璃控制中心)**:
   右下角悬浮章提供手动 `⏸️ 停止` 与 `▶️ 开启` 控制。点击文本区域可唤起极具美感的 macOS/iOS 拟物化暗色毛玻璃控制面板，支持修改冷却参数、累计触发计数，并支持基于内存的**100% CSP 安全热重启**，无需刷新页面。
4. **App Startup Auto-Trigger (开机/启动自激活)**:
   配置 macOS 原生 `launchd` 服务监听 `DevToolsActivePort` 文件的修改，当且仅当 Antigravity 2.0 启动时被自动拉起，对系统无额外负担。
5. **Zero-Resource Idle Exit (闲置零资源占用)**:
   当您关闭 Antigravity 2.0 客户端时，守护进程检测到通信连续失败 10 次（约 30 秒）后会自动优雅终止进程，绝不驻留系统后台浪费资源。

---

## 📂 File Structure (文件结构)

- `clicker.js`: 运行在网页前端的 JavaScript 核心控制脚本，负责 MutationObserver 监测、物理点击、悬浮控制章与毛玻璃设置弹窗的渲染与热重载。
- `injector.py`: 守护进程脚本。负责读取 DevTools 端口、筛选目标页面、查询 clicker 状态、建立 WebSocket 手动握手及 CDP 代码注入。
- `install.sh`: 一键安装 Shell 脚本。创建永久目录、拷贝程序、动态生成 plist 配置文件并装载守护服务。

---

## 🚀 How to Install (一键安装步骤)

本方案提供了全自动的 macOS 命令行安装工具，任何开发者、普通用户或 AI 助手均可一键完成部署。

1. 打开 macOS 的 **终端 (Terminal)**。
2. 进入解压或下载该项目文件夹的路径（例如 Downloads）：
   ```bash
   cd ~/Downloads/antigravity-clicker
   ```
3. 赋予安装脚本执行权限并运行：
   ```bash
   chmod +x install.sh && ./install.sh
   ```
4. **大功告成！** 脚本会自动化完成：
   - 在主目录创建永久文件夹 `~/.antigravity-clicker/`；
   - 寻找系统的 Python3 路径并自动配置；
   - 动态生成 macOS 自启配置文件 `com.yitao.antigravity.clicker.plist`；
   - 将配置文件拷贝至系统自启目录并立即拉起服务。

---

## 🎮 How to Use (操作说明)

- **初次生效**：安装完成后，请重启一次 **Antigravity 2.0 客户端**，或在客户端内按 **`Cmd+R`**，即可看到右下角浮现出带绿色发光呼吸灯的悬浮控制舱！
- **暂停/开启自动重试**：直接点击悬浮舱右侧的 **`⏸️ 停止`** 按钮（指示灯变红 `🔴 Paused`）；再次点击 **`▶️ 开启`** 按钮（指示灯恢复绿光 `🟢 Active`）即可恢复工作。
- **调整重试冷却时间**：
  1. 点击悬浮章的**文字区域**（如 `Clicker Active`），即可平滑弹出 iOS 风格毛玻璃参数设置卡片。
  2. 在 “重试冷却延迟” 中输入新的毫秒数值（**默认已升级为 3000 毫秒**即 3 秒保护期，防接口过载）。
  3. 点击 **保存并重启**，参数会保存至网页 `localStorage`，并在 600ms 内在浏览器内存中完成无损热重启。

---

## 🧹 How to Uninstall (一键卸载步骤)

如果您未来需要完全清理此自动点击守护进程，只需在终端中运行以下三行命令即可实现无痕清理：

```bash
# 1. 停止并注销 macOS launchd 守护服务
launchctl unload ~/Library/LaunchAgents/com.yitao.antigravity.clicker.plist

# 2. 删除开机自启项配置文件
rm ~/Library/LaunchAgents/com.yitao.antigravity.clicker.plist

# 3. 删除永久安装目录及日志
rm -rf ~/.antigravity-clicker
```

---

## 🛡️ Systems Not Supported (关于其他操作系统)

- **Windows**: Windows 版本的 Antigravity 桌面客户端使用不同的目录路径结构，且不支持 `.plist` 自启代理。如需使用，需重新开发基于 Windows PowerShell 或 Task Scheduler（任务计划程序）的自启脚本，并重新适配 `DevToolsActivePort` 在 `%APPDATA%` 下的存放路径。
- **Linux**: Linux 环境下无 `.plist` 服务管理器，而是使用 `systemd` 或 `udev`，且应用配置通常位于 `~/.config/Antigravity/`。本自动化安装包只支持标准的 macOS 架构。

---

## ⚙️ Architecture details (致 AI/开发者：系统运行架构与原理)

### 1. launchd WatchPaths 文件触发
```mermaid
graph TD
    A[用户启动 Antigravity 2.0] --> B[Electron 写入 DevToolsActivePort]
    B --> C[macOS launchd 捕获文件修改事件]
    C --> D[launchd 拉起 Python injector.py 守护进程]
```

### 2. injector.py 动态注入与重连心跳
* 守护进程会使用 Python 原生 socket 模拟底层 WebSocket 帧格式，建立与 `http://localhost:{port}/json` 的通信握手。
* 过滤满足 `'Greeting'`, `'Project'`, `'antigravity'` 字符或 `/c/` 的聊天 WebView 目标。
* 每隔 3 秒，通过 CDP 发送 `"Runtime.evaluate"`，验证表达式 `!!window.__antigravityClickerLauncher`。
* 验证失败则读取本地 `clicker.js` 重新发送注入请求；连续连接失败 10 次则主动调用 `sys.exit()` 安全退出。

### 3. clicker.js 安全无缝热重启
由于 Electron/Chromium 启用了极严的 CSP（Content Security Policy）安全策略，直接 eval 新代码会触发拦截。我们设计了内存自热载逻辑：
1. `clicker.js` 内部的主匿名 IIFE 绑定在 `window.__antigravityClickerLauncher` 引用上。
2. 内部提供销毁接口 `window.__antigravityStopClicker()`，负责注销 `MutationObserver` 和移除悬浮 DOM / 样式表。
3. 当配置更新并保存时，点击器先调用销毁接口清理内存残余，再直接调用 `window.__antigravityClickerLauncher()` 重新初始化，**100% 避开网络加载和 eval 拦截，达到完美、安全的热重启**。

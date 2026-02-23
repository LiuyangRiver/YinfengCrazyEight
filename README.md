# Crazy Eights (疯狂 8)

这是一个使用 React + Vite + Tailwind CSS 开发的经典卡牌游戏。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署到 GitHub 和 Vercel

### 1. 同步到 GitHub

1. 在 GitHub 上创建一个新的仓库。
2. 在本地终端运行以下命令：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

### 2. 部署到 Vercel

1. 登录 [Vercel](https://vercel.com)。
2. 点击 "Add New" -> "Project"。
3. 导入你刚刚创建的 GitHub 仓库。
4. Vercel 会自动识别这是一个 Vite 项目。
5. 点击 "Deploy"。

### 注意事项

*   **环境变量**：如果你使用了 Gemini API，请在 Vercel 的项目设置中添加 `GEMINI_API_KEY` 环境变量。
*   **单页应用路由**：我已经添加了 `vercel.json` 文件，以确保在 Vercel 上刷新页面时路由能正常工作。

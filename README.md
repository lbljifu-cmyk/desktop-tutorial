# SEAN Store

[![Deploy SEAN Store to GitHub Pages](https://github.com/lbljifu-cmyk/desktop-tutorial/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/lbljifu-cmyk/desktop-tutorial/actions/workflows/deploy-pages.yml)

三语商品展示网站（简体中文 / 日本語 / English），使用 React、TypeScript、Vite 和 Tailwind CSS。

## 本地运行

```bash
npm ci
npm run dev
```

开发服务器默认运行在 `http://localhost:4173`。

## GitHub Pages 发布

仓库 `JEFF` 分支有新提交时，GitHub Actions 会自动构建并发布到：

https://lbljifu-cmyk.github.io/desktop-tutorial/

首次发布前，请在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。也可以在 **Actions** 标签页手动运行 “Deploy SEAN Store to GitHub Pages” 工作流。

## 生产环境说明

此网站目前是商品展示原型。购物袋可用于演示，但结账、支付、账户登录和下单服务尚未接入；上线销售前请确认商品、库存、卖家信息、隐私政策及交易条款。

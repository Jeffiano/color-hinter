#!/bin/bash

# 确保构建输出目录存在
rm -rf out
mkdir -p out

# 运行构建
echo "Building project..."
npm run build

# 部署到 Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
npx wrangler pages publish out \
  --project-name=color-hinter \
  --branch=main

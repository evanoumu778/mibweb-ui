#!/bin/bash

echo "🔍 验证项目配置..."

# 检查Node.js版本
echo "📦 Node.js版本检查..."
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
    echo "✅ Node.js版本符合要求: $node_version"
else
    echo "❌ Node.js版本过低: $node_version (需要 >= $required_version)"
    exit 1
fi

# 检查环境变量
echo "🔧 环境变量检查..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 环境变量未设置"
    echo "请在Vercel项目中配置Neon数据库连接"
    exit 1
else
    echo "✅ DATABASE_URL 已配置"
fi

# 检查依赖
echo "📚 依赖检查..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules不存在，正在安装依赖..."
    npm install
fi

# 测试构建
echo "🏗️  测试构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo "🎉 项目配置验证完成！"

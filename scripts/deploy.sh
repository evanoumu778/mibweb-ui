#!/bin/bash

echo "🚀 开始部署 MIB Web 平台..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p redis nginx/ssl database/init

# 设置权限
chmod +x scripts/*.sh

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理旧镜像 (可选)
read -p "是否清理旧镜像? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker system prune -f
fi

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 显示日志
echo "📝 显示服务日志..."
docker-compose logs --tail=50

echo "✅ 部署完成!"
echo "🌐 前端访问: http://localhost:3000"
echo "🔧 后端API: http://localhost:8080"
echo "📊 数据库: localhost:5432"
echo "🗄️ Redis: localhost:6379"

# 显示有用的命令
echo ""
echo "📋 常用命令:"
echo "  查看日志: docker-compose logs -f [service_name]"
echo "  重启服务: docker-compose restart [service_name]"
echo "  停止服务: docker-compose down"
echo "  进入容器: docker-compose exec [service_name] sh"

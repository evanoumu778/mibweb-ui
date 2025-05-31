#!/bin/bash

echo "🚀 启动 MIB Web 平台..."

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 请先安装 Docker"
    exit 1
fi

# 启动服务
docker-compose -f docker-compose.simple.yml up --build -d

echo "⏳ 等待服务启动..."
sleep 20

# 检查状态
docker-compose -f docker-compose.simple.yml ps

echo "✅ 启动完成!"
echo "🌐 访问: http://localhost:3000"
echo "🧪 测试: http://localhost:3000/test"

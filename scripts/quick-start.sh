#!/bin/bash

echo "⚡ MIB Web 平台一键启动脚本"

# 检查是否首次运行
if [ ! -f ".env" ]; then
    echo "📝 创建环境配置文件..."
    cat > .env << EOF
# 自动生成的环境配置
NODE_ENV=production
DATABASE_URL=postgresql://netmon_user:netmon_pass_2024@postgres:5432/network_monitor
REDIS_URL=redis://:redis_pass_2024@redis:6379
NEXTAUTH_SECRET=mibweb_secret_key_2024_very_secure
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=http://localhost:8080
JWT_SECRET=jwt_secret_key_2024_very_secure
EOF
fi

# 一键启动
echo "🚀 启动所有服务..."
docker-compose up -d

echo "✅ 启动完成! 访问 http://localhost:3000"

#!/bin/bash

# 构建优化脚本
set -e

echo "🚀 开始优化构建环境..."

# 检查Node.js版本
echo "📦 检查Node.js版本..."
node_version=$(node -v)
echo "当前Node.js版本: $node_version"

if [[ "$node_version" < "v18.0.0" ]]; then
    echo "⚠️  警告: 建议使用Node.js 18.0.0或更高版本"
fi

# 设置npm国内源
echo "🌐 配置npm国内源..."
npm config set registry https://registry.npmmirror.com/
npm config set disturl https://npmmirror.com/dist

# 清理缓存
echo "🧹 清理npm缓存..."
npm cache clean --force

# 检查Go版本
if command -v go &> /dev/null; then
    echo "🐹 检查Go版本..."
    go_version=$(go version)
    echo "当前Go版本: $go_version"
    
    # 设置Go代理
    echo "🌐 配置Go代理..."
    go env -w GOPROXY=https://goproxy.cn,direct
    go env -w GOSUMDB=sum.golang.google.cn
fi

# 检查Docker版本
if command -v docker &> /dev/null; then
    echo "🐳 检查Docker版本..."
    docker_version=$(docker --version)
    echo "当前Docker版本: $docker_version"
fi

# 创建.env.example文件
echo "📝 创建环境变量示例文件..."
cat > .env.example << EOF
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/mibweb
POSTGRES_URL=postgresql://username:password@localhost:5432/mibweb

# Redis配置
REDIS_URL=redis://localhost:6379

# 应用配置
NODE_ENV=development
PORT=3000
BACKEND_PORT=8080

# 监控系统配置
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
ZABBIX_URL=http://localhost:8080

# 告警配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=alerts@example.com
SMTP_PASS=password

# 钉钉机器人
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx

# Slack配置
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx
EOF

echo "✅ 构建环境优化完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 复制 .env.example 为 .env 并填写实际配置"
echo "2. 运行 'npm install' 安装前端依赖"
echo "3. 运行 'cd backend && go mod download' 安装后端依赖"
echo "4. 运行 'docker-compose -f docker-compose.dev.yml up' 启动开发环境"

# 使用国内镜像源优化构建
FROM node:18-alpine AS base

# 设置国内npm源
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set disturl https://npmmirror.com/dist && \
    npm config set electron_mirror https://npmmirror.com/mirrors/electron/ && \
    npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass/

# 安装系统依赖
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 依赖安装阶段
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .

# 设置构建环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制生产依赖
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

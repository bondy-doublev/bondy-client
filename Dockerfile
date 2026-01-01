# Stage 1: Build app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

# Tạo group và user non-root đúng cách cho Alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S -D -H -G nodejs nextjs

# Copy các file cần thiết từ builder, và set owner đúng
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Cài chỉ production dependencies
RUN npm ci --omit=dev && \
    npm cache clean --force

# Chuyển sang user non-root
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Chạy app
CMD ["npm", "run", "start"]
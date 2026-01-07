# Bondy Social App — Frontend Client

Bondy Social App là ứng dụng mạng xã hội hiện đại được xây dựng bằng **Next.js 14** (App Router), hỗ trợ đăng nhập OAuth2, chat thời gian thực, upload media, thông báo, và tích hợp đầy đủ với backend Bondy Server.

## 🚀 Tính năng chính

- Đăng nhập OAuth2 với **GitHub**, **Google**, **Discord**
- Giao diện responsive, tối ưu mobile-first với Tailwind CSS
- Chat thời gian thực (WebSocket)
- Upload hình ảnh/video/reel
- Thông báo push/real-time
- Feed cá nhân hóa với gợi ý nội dung
- Tương tác social: like, comment, share, follow...

## 📦 Yêu cầu hệ thống

- **Node.js >= 20** (khuyến nghị LTS)
- npm / yarn / pnpm

## ⚙️ Cài đặt

```bash
git clone https://github.com/your-org/bondy-client.git
cd bondy-client
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

## 🔑 Biến môi trường (.env.local)

Tạo file `.env.local` ở thư mục gốc dự án và điền các giá trị sau:

```dotenv
# Môi trường
NODE_ENV=development                    # development | production

# Backend URLs
NEXT_PUBLIC_API_URL=http://localhost:8080                # URL của API Gateway (Bondy Server)
NEXT_PUBLIC_UPLOAD_BASE_URL=http://localhost:8080/upload # Endpoint upload (thường qua gateway)
NEXT_PUBLIC_MEDIA_URL=http://localhost:8080/media        # URL phục vụ file media (hoặc CDN/S3 sau này)

# Communication (NestJS service - chat/call)
NEXT_PUBLIC_CHAT_URL=ws://localhost:3001                 # WebSocket URL cho chat real-time
NEXT_PUBLIC_COMM_PATH=/socket.io                         # Path nếu dùng Socket.IO (tùy config)

# Notification
NEXT_PUBLIC_NOTIFICATION_WS_URL=ws://localhost:3002      # WebSocket cho thông báo (nếu tách riêng)

# NextAuth.js
AUTH_SECRET=your_very_strong_random_secret_32_chars_min  # openssl rand -base64 32
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://localhost:3000                       # URL của frontend

# OAuth Providers
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# JWT (phải khớp với backend)
NEXT_PUBLIC_JWT_SECRET=your-very-strong-jwt-secret-key-min-256-bits

# Firebase (cho push notification - tùy chọn)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Metered (nếu dùng cho video call - tùy chọn)
NEXT_PUBLIC_METERED_API_KEY=
```

### Hướng dẫn lấy giá trị

- **NEXT_PUBLIC_API_URL**: Trỏ đến **gateway** của Bondy Server (ví dụ: `http://localhost:8080` hoặc domain production).
- **AUTH_SECRET**: Tạo ngẫu nhiên bằng lệnh:
  ```bash
  openssl rand -base64 32
  ```
- **JWT_SECRET**: Phải **giống hệt** với `JWT_SECRET` trong backend (auth-service & gateway).
- **OAuth credentials**: Tạo ứng dụng tại:
  - GitHub: https://github.com/settings/developers
  - Google: https://console.cloud.google.com/
  - Discord: https://discord.com/developers/applications

**Callback URL** (Authorized redirect URI) cho từng provider:

```
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/discord
```

(Thay `localhost:3000` bằng domain production khi deploy)

## ▶️ Chạy ứng dụng

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở trình duyệt: [http://localhost:3000](http://localhost:3000)

## 📦 Build cho Production

```bash
npm run build
npm start
```

## 🐳 Docker (tùy chọn)

File `Dockerfile` và `docker-compose.yml` đã có sẵn để containerize:

```bash
docker compose up --build
```

## 📖 Lưu ý quan trọng

- **Không bao giờ commit** file `.env.local` lên Git.
- File `.env.example` đã được cung cấp để chia sẻ cấu trúc biến môi trường với team.
- Đảm bảo backend (Bondy Server) đang chạy trước khi khởi động frontend.
- Khi deploy production: thay tất cả `localhost` bằng domain thật và dùng HTTPS.

## Cây thư mục chính

```
bondy-client/
├─ .env.example
├─ .env.production          # Mẫu cho production
├─ public/
├─ src/
│  ├─ app/                  # App Router (pages)
│  ├─ components/           # UI components
│  ├─ lib/                  # Utils, API clients
│  └─ styles/
├─ Dockerfile
├─ docker-compose.yml
├─ next.config.ts
├─ tailwind.config.ts
└─ README.md
```

Chào mừng bạn đến với Bondy — mạng xã hội của tương lai! 🚀

Có vấn đề gì cứ mở issue hoặc pull request nhé!

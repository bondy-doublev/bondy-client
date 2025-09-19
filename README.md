# Bondy Social App

Bondy Social App is a social networking application built with **Next.js**, featuring authentication via GitHub, Google, and Discord.

## 🚀 Features

- OAuth2 login with GitHub, Google, and Discord
- Modern frontend built with Next.js
- Easy configuration via environment variables

## 📦 Requirements

- Node.js >= 18
- npm, yarn, or pnpm package manager

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/bondy-social-app.git
cd bondy-social-app
npm install
# or
yarn install
# or
pnpm install
```

## 🔑 Environment Variables

Create a `.env.local` file in the project root and configure the following variables:

```env
NEXT_PUBLIC_API_URL=
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
NEXT_PUBLIC_JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

### How to obtain these values:

- **NEXT_PUBLIC_API_URL**: Base URL of your backend API (e.g., http://localhost:4000 or production API endpoint).

- **AUTH_SECRET**: A secret string used by NextAuth for session encryption. You can generate one with `openssl rand -base64 32`.

- **AUTH_GITHUB_ID / AUTH_GITHUB_SECRET**: Create an OAuth App in [GitHub Developer Settings](https://github.com/settings/developers).

- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET**: Create credentials in [Google Cloud Console](https://console.cloud.google.com/).

- **DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET**: Register an application in [Discord Developer Portal](https://discord.com/developers/applications).

- **NEXT_PUBLIC_JWT_SECRET**: Secret string used for signing JWT tokens. Recommended to generate randomly.

⚠️ Make sure you set the **Authorized Redirect URI / Callback URL** for each provider to:

```
http://localhost:3000/api/auth/callback/<provider>
```

Example:

- `http://localhost:3000/api/auth/callback/github`
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/discord`

## ▶️ Running the App

Start the development server:

```bash
npm run dev
```

By default, the app runs at: [http://localhost:3000](http://localhost:3000)

## 📦 Building for Production

```bash
npm run build
npm start
```

## 📖 Notes

- Ensure all OAuth providers (GitHub, Google, Discord) are properly configured with correct callback URLs.

- Keep your secrets safe and never commit your `.env.local` file to version control.

- You can commit `.env.example` to share required environment variables with your team.

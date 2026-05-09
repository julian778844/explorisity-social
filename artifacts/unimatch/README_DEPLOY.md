# Vercel Settings for Explorisity Frontend

Use these Vercel settings:

```txt
Framework Preset: Vite
Root Directory: artifacts/unimatch
Install Command: cd ../.. && corepack enable && pnpm install --frozen-lockfile
Build Command: cd ../.. && pnpm --filter @workspace/unimatch build
Output Directory: dist/public
```

Environment variables:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com/api
BASE_PATH=/
```

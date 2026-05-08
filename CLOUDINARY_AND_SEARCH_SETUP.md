
# Explorisity Cloudinary + Search Setup

## Environment Variables

Backend:
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Frontend:
VITE_API_URL=https://your-backend-url.onrender.com/api

## Added Features
- Avatar upload endpoint
- Global sidebar search UI
- School/user/community search API
- Search modal scaffold
- Cloudinary integration placeholders

## Suggested Packages

Backend:
pnpm add cloudinary multer multer-storage-cloudinary

Frontend:
pnpm add lucide-react

## Suggested API Routes
POST /api/upload/avatar
GET /api/search?q=harvard


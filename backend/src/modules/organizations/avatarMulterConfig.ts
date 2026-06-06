import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';

const AVATAR_DIR = path.join(config.upload.tempDir, 'avatars');
const MAX_AVATAR_SIZE_MB = 2;

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    cb(new AppError('Only JPG, PNG, WebP, and GIF images are allowed', 400, 'INVALID_FILE_TYPE'));
    return;
  }

  cb(null, true);
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_AVATAR_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

export { AVATAR_DIR };

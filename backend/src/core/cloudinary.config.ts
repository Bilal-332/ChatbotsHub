import { v2 as cloudinary } from 'cloudinary';

import { config } from '@shared/config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export { cloudinary };

export function isCloudinaryUrl(fileUrl: string): boolean {
  try {
    const parsed = new URL(fileUrl);
    return parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}
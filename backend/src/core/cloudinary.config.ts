import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

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

export function getCloudinaryPublicId(fileUrl: string): string | null {
  if (!isCloudinaryUrl(fileUrl)) return null;

  try {
    const parsed = new URL(fileUrl);
    const uploadIndex = parsed.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const assetPath = parsed.pathname.slice(uploadIndex + '/upload/'.length);
    const withoutVersion = assetPath.replace(/^v\d+\//, '');
    const withoutExtension = withoutVersion.replace(/\.[^.\/]+$/, '');

    return withoutExtension || null;
  } catch {
    return null;
  }
}

export async function uploadImageToCloudinary(filePath: string, folder: string): Promise<{
  secureUrl: string;
  publicId: string;
}> {
  const result = (await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  })) as UploadApiResponse;

  if (typeof result.secure_url !== 'string' || !result.secure_url) {
    throw new Error('Cloudinary upload failed: missing secure_url');
  }

  if (typeof result.public_id !== 'string' || !result.public_id) {
    throw new Error('Cloudinary upload failed: missing public_id');
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteCloudinaryImage(fileUrl?: string | null): Promise<void> {
  if (!fileUrl || !isCloudinaryUrl(fileUrl)) return;

  const publicId = getCloudinaryPublicId(fileUrl);
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}
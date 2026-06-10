const getCloudinaryConfig = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured');
  }

  if (!uploadPreset) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not configured');
  }

  return { cloudName, uploadPreset };
};

export async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { secure_url?: unknown; error?: { message?: unknown } }
    | null;

  if (!response.ok) {
    const message =
      typeof data?.error?.message === 'string'
        ? data.error.message
        : 'Cloudinary upload failed';
    throw new Error(message);
  }

  if (typeof data?.secure_url !== 'string' || !data.secure_url) {
    throw new Error('Invalid Cloudinary response: missing secure_url');
  }

  return data.secure_url;
}
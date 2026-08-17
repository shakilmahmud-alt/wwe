// ImageKit.io Ultra-Fast Direct Cloud Upload Utility
const getEnv = (key: string) => {
  try {
    return (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env[key] : process.env[key]);
  } catch {
    return process.env[key];
  }
};

export const IMAGEKIT_CONFIG = {
  publicKey: getEnv('VITE_IMAGEKIT_PUBLIC_KEY') || 'public_4xJrmuozjePE+d6nOK8b0ZWegWw=',
  privateKey: getEnv('VITE_IMAGEKIT_PRIVATE_KEY') || 'private_xd0dqMmEyjl/tOb+3PeP5R4Ylag=',
  urlEndpoint: getEnv('VITE_IMAGEKIT_URL_ENDPOINT') || 'https://ik.imagekit.io/eg7u6xcn0u'
};

/**
 * Fast client-side image optimization helper.
 * Resizes large images (over 500KB) to max 1200px in ~20ms before upload to make transfer sub-second.
 */
async function optimizeImageForFastUpload(file: File): Promise<Blob | File> {
  if (file.size <= 400 * 1024 || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxDimension = 1200;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image file DIRECTLY to ImageKit.io cloud CDN in sub-second speed.
 */
export async function uploadToImageKit(file: File): Promise<string> {
  const optimizedFile = await optimizeImageForFastUpload(file);
  const cleanFileName = (file.name || `champion_${Date.now()}.png`).replace(/[^a-zA-Z0-9_.-]/g, '_');

  const formData = new FormData();
  formData.append('file', optimizedFile, cleanFileName);
  formData.append('fileName', cleanFileName);
  formData.append('publicKey', IMAGEKIT_CONFIG.publicKey);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', '/wwe_champions');

  // Direct basic authentication header for ImageKit API
  const authHeader = 'Basic ' + btoa(`${IMAGEKIT_CONFIG.privateKey}:`);

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload Failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.url) {
    return data.url;
  }

  throw new Error('ImageKit upload did not return a valid CDN URL');
}

// ImageKit.io Upload Utility
export const IMAGEKIT_CONFIG = {
  publicKey: 'public_4xJrmuozjePE+d6nOK8b0ZWegWw=',
  privateKey: 'private_xd0dqMmEyjl/tOb+3PeP5R4Ylag=',
  urlEndpoint: 'https://ik.imagekit.io/eg7u6xcn0u'
};

/**
 * Uploads an image file to ImageKit.io cloud storage and returns the CDN URL.
 * Falls back gracefully to direct ImageKit REST API if dev server middleware is unavailable.
 */
export async function uploadToImageKit(file: File): Promise<string> {
  const fileName = file.name || `champion_${Date.now()}.png`;

  // 1. Try local dev server middleware API first
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-file-name': encodeURIComponent(fileName)
      },
      body: file
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url && data.url.startsWith('http')) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Dev server upload API unavailable, switching to direct ImageKit REST API:', err);
  }

  // 2. Direct ImageKit API upload via Client
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  formData.append('publicKey', IMAGEKIT_CONFIG.publicKey);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', '/wwe_champions');

  // Basic auth header using Private Key
  const authHeader = 'Basic ' + btoa(`${IMAGEKIT_CONFIG.privateKey}:`);

  const ikResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader
    },
    body: formData
  });

  if (!ikResponse.ok) {
    const errorText = await ikResponse.text();
    throw new Error(`ImageKit Upload Error (${ikResponse.status}): ${errorText}`);
  }

  const ikData = await ikResponse.json();
  if (ikData.url) {
    return ikData.url;
  }

  throw new Error('ImageKit upload returned invalid response');
}

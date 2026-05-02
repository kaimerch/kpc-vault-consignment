export async function uploadPhotoToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'kpc-vault/consignment');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Photo upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
}

export async function uploadPhotos(files: File[], onProgress?: (done: number, total: number) => void): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadPhotoToCloudinary(files[i]);
    urls.push(url);
    onProgress?.(i + 1, files.length);
  }
  return urls;
}

const AVATAR_EDGE_PX = 512;
const AVATAR_WEBP_QUALITY = 0.82;
const AVATAR_MAX_OUTPUT_BYTES = 700_000;

export async function prepareAvatarImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('invalid-file');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, AVATAR_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('invalid-file');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', AVATAR_WEBP_QUALITY));
  if (!blob || blob.size > AVATAR_MAX_OUTPUT_BYTES) throw new Error('file-too-large');
  return new File([blob], 'avatar.webp', { type: 'image/webp' });
}

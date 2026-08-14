/**
 * PT-friendly slug for download filenames.
 */
export function sanitizeFileName(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'teoria-da-mudanca';
}

'use server';

import { revalidatePath } from 'next/cache';
import type { AuthUser } from '../domain/auth.types';
import { getAuthenticatedSession } from './auth-session';
import { createServerAuthRepository } from './auth-server.repository';

const MAX_AVATAR_BYTES = 700_000;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type UpdateUserAvatarResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: 'invalid-file' | 'file-too-large' | 'session-expired' };

export async function updateUserAvatarAction(formData: FormData): Promise<UpdateUserAvatarResult> {
  const authenticated = await getAuthenticatedSession();
  if (!authenticated) return { ok: false, error: 'session-expired' };

  const file = formData.get('avatar');
  if (!(file instanceof File) || !ALLOWED_AVATAR_TYPES.has(file.type)) {
    return { ok: false, error: 'invalid-file' };
  }
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, error: 'file-too-large' };

  const bytes = Buffer.from(await file.arrayBuffer());
  const avatarUrl = `data:${file.type};base64,${bytes.toString('base64')}`;
  const repository = createServerAuthRepository();
  const updated = await repository.updateUserAvatar(authenticated.session.id, avatarUrl);
  if (!updated) return { ok: false, error: 'session-expired' };
  revalidatePath('/canvas');
  revalidatePath('/canvas/resultado');
  return { ok: true, user: updated.user };
}

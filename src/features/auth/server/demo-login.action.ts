'use server';

import { redirect } from 'next/navigation';
import { createServerAuthRepository } from './auth-server.repository';
import { sanitizeReturnTo, writeAuthSessionCookie } from './auth-session';

export async function demoLoginAction(formData: FormData) {
  const authenticated = await createServerAuthRepository().createDemoSession();
  await writeAuthSessionCookie(authenticated.session.id);
  redirect(sanitizeReturnTo(String(formData.get('returnTo') ?? '')));
}

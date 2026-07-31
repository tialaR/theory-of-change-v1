import { redirect } from 'next/navigation';
import { getAuthenticatedSession, sanitizeReturnTo } from './server/auth-session';
import { LoginPage } from './ui/login/login-page';

export type AuthPageProps = {
  returnTo?: string;
};

export async function AuthPage({ returnTo }: AuthPageProps) {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  const authenticated = await getAuthenticatedSession();
  if (authenticated) redirect(safeReturnTo);
  return <LoginPage returnTo={safeReturnTo} />;
}

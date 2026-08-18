import { redirect } from 'next/navigation';
import { getAuthenticatedSession, sanitizeReturnTo } from './server/auth-session';
import { RegisterPage } from './ui/register/register-page';

export type RegistrationPageProps = {
  returnTo?: string;
};

export async function RegistrationPage({ returnTo }: RegistrationPageProps) {
  const safeReturnTo = sanitizeReturnTo(returnTo);
  const authenticated = await getAuthenticatedSession();
  if (authenticated) redirect(safeReturnTo);

  return <RegisterPage returnTo={safeReturnTo} />;
}

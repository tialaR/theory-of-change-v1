import { RegistrationPage } from '@/features/auth/server';

export default async function RegisterRoutePage({
  searchParams
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return <RegistrationPage returnTo={returnTo} />;
}

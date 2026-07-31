import { AuthPage } from '@/features/auth';

export default async function LoginRoutePage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return <AuthPage returnTo={returnTo} />;
}

import type { AuthenticatedSession } from '../../domain/auth.types';

export type AuthApiEnvelope = {
  data: AuthenticatedSession;
  meta: { requestId: string; schemaVersion: 1 };
};

export function isAuthApiEnvelope(value: unknown): value is AuthApiEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Partial<AuthApiEnvelope>;
  return Boolean(
    envelope.data?.user?.id &&
    envelope.data?.session?.id &&
    envelope.meta?.schemaVersion === 1
  );
}

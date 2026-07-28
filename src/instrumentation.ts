export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { startMockApiServer } = await import('./mocks/server');
  startMockApiServer();
}

const PUBLIC_ROUTE_SIMULATED_LATENCY_MS = 900;

export async function simulatePublicRouteDelay(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, PUBLIC_ROUTE_SIMULATED_LATENCY_MS);
  });
}

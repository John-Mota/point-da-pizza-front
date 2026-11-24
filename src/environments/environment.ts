const obtenerEnv = (): Record<string, string | undefined> =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const environment = {
  production: true,
  get API_BASE_URL(): string {
    return obtenerEnv()['API_BASE_URL'] ?? '';
  },
  get WHATS_APP(): string {
    return obtenerEnv()['WHATS_APP'] ?? '';
  },
};

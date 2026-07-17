interface RuntimeEnv {
  API_BASE_URL?: string;
  API_UPSTREAM?: string;
}

declare global {
  interface Window {
    __env?: RuntimeEnv;
  }
}

export function getRuntimeEnv(): RuntimeEnv {
  if (typeof window === 'undefined') {
    return {};
  }

  return window.__env ?? {};
}

export function getApiBasePath(): string {
  const env = getRuntimeEnv();
  return env.API_BASE_URL ?? '';
}


export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'CUSTOMER';

type TokenPayload = {
  sub?: string;
  email?: string;
  role?: AppRole;
  iat?: number;
  exp?: number;
};

const TOKEN_KEY = 'moda_access_token';

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4);
  return atob(padded);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getTokenPayload(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = getTokenPayload();
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function getCurrentRole(): AppRole | null {
  const payload = getTokenPayload();
  if (!payload?.role) return null;
  return payload.role;
}

export function hasAnyRole(allowed: AppRole[]): boolean {
  const role = getCurrentRole();
  if (!role) return false;
  return allowed.includes(role);
}

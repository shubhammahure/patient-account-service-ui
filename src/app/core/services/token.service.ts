import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly accessKey = 'pa_access_token';
  private readonly refreshKey = 'pa_refresh_token';
  private readonly rememberMeKey = 'pa_remember_me';
  private readonly expiresAtKey = 'pa_access_expires_at';

  get accessToken(): string | null {
    return localStorage.getItem(this.accessKey) ?? sessionStorage.getItem(this.accessKey);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.refreshKey) ?? sessionStorage.getItem(this.refreshKey);
  }

  get rememberMe(): boolean {
    const fromLocal = localStorage.getItem(this.rememberMeKey);
    const fromSession = sessionStorage.getItem(this.rememberMeKey);
    const stored = fromLocal ?? fromSession;
    return stored !== 'false';
  }

  get expiresAtMs(): number | null {
    const stored = localStorage.getItem(this.expiresAtKey) ?? sessionStorage.getItem(this.expiresAtKey);
    if (!stored) {
      return null;
    }

    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : null;
  }

  setTokens(accessToken: string, refreshToken: string, rememberMe = true, expiresInMs?: number): void {
    this.clear();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.accessKey, accessToken);
    storage.setItem(this.refreshKey, refreshToken);

    if (typeof expiresInMs === 'number' && Number.isFinite(expiresInMs)) {
      storage.setItem(this.expiresAtKey, String(Date.now() + expiresInMs));
    }

    storage.setItem(this.rememberMeKey, String(rememberMe));
  }

  isAccessTokenExpired(skewMs = 0): boolean {
    const token = this.accessToken;
    if (!token) {
      return true;
    }

    const jwtExpiry = this.getJwtExpiryMs(token);
    const expiry = jwtExpiry ?? this.expiresAtMs;
    if (!expiry) {
      return false;
    }

    return Date.now() + Math.max(skewMs, 0) >= expiry;
  }

  clear(): void {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.expiresAtKey);
    localStorage.removeItem(this.rememberMeKey);
    sessionStorage.removeItem(this.accessKey);
    sessionStorage.removeItem(this.refreshKey);
    sessionStorage.removeItem(this.expiresAtKey);
    sessionStorage.removeItem(this.rememberMeKey);
  }

  private getJwtExpiryMs(token: string): number | null {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      const parsed = JSON.parse(decoded) as { exp?: number };
      return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}

import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from '../core/api/generated';
import { TokenService } from '../core/services/token.service';

interface AuthState {
  username: string;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  sessionTimedOut: boolean;
}

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>({
    username: '',
    roles: [],
    isAuthenticated: false,
    isLoading: false,
    error: '',
    sessionTimedOut: false,
  }),
  withComputed((store) => ({
    canViewClinical: computed(() =>
      store.roles().some((r) => r.includes('DOCTOR') || r.includes('ADMIN'))
    ),
  })),
  withMethods((store) => {
    const authApi = inject(AuthenticationService);
    const tokenService = inject(TokenService);
    const router = inject(Router);

    let sessionTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

    function clearTimer(): void {
      if (sessionTimeoutHandle) {
        clearTimeout(sessionTimeoutHandle);
        sessionTimeoutHandle = undefined;
      }
    }

    function resetTimer(): void {
      clearTimer();
      sessionTimeoutHandle = setTimeout(
        () => void methods.logout(true, true),
        SESSION_TIMEOUT_MS
      );
    }

    function unwrap<T>(response: unknown): T {
      if (response && typeof response === 'object' && 'data' in (response as object)) {
        return (response as { data: T }).data;
      }
      return response as T;
    }

    async function loadCurrentUser(): Promise<void> {
      const resp = await firstValueFrom(authApi.currentUser());
      const profile = unwrap<{ username?: string; roles?: string[] }>(resp);
      patchState(store, {
        username: profile.username ?? '',
        roles: profile.roles ?? [],
        isAuthenticated: true,
      });
    }

    function callAuth<T>(ops: string[], ...args: unknown[]) {
      for (const op of ops) {
        const fn = (authApi as unknown as Record<string, unknown>)[op];
        if (typeof fn === 'function') {
          return (fn as (...a: unknown[]) => import('rxjs').Observable<T>).apply(authApi, args);
        }
      }
      throw new Error(`Missing auth operation: ${ops.join(', ')}`);
    }

    const methods = {
      async login(username: string, password: string, rememberMe = true): Promise<void> {
        patchState(store, { isLoading: true, error: '', sessionTimedOut: false });
        try {
          const resp = await firstValueFrom(
            callAuth<{ accessToken: string; refreshToken: string; expiresInMs?: number }>(
              ['login1', 'login_1', 'login'],
              { username, password }
            )
          );
          const tokens = unwrap<{ accessToken: string; refreshToken: string; expiresInMs?: number }>(resp);
          tokenService.setTokens(tokens.accessToken, tokens.refreshToken, rememberMe, tokens.expiresInMs);
          await loadCurrentUser();
          resetTimer();
        } catch {
          tokenService.clear();
          patchState(store, { error: 'Authentication failed', isAuthenticated: false });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async register(payload: {
        username: string;
        email: string;
        password: string;
        roles: string[];
      }): Promise<void> {
        patchState(store, { isLoading: true, error: '' });
        try {
          await firstValueFrom(callAuth(['register', 'register_1'], payload));
        } catch {
          patchState(store, { error: 'Registration failed' });
          throw new Error('Registration failed');
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async hydrateFromToken(): Promise<void> {
        if (!tokenService.accessToken || tokenService.isAccessTokenExpired(5_000)) {
          tokenService.clear();
          patchState(store, { username: '', roles: [], isAuthenticated: false, error: '' });
          return;
        }
        patchState(store, { isLoading: true });
        try {
          await loadCurrentUser();
          resetTimer();
        } catch {
          tokenService.clear();
          patchState(store, { username: '', roles: [], isAuthenticated: false, error: '' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async logout(navigateToLogin = true, timedOut = false): Promise<void> {
        clearTimer();
        try {
          await firstValueFrom(callAuth(['logout']));
        } catch {
          /* ignore server errors — local cleanup still clears the session */
        }
        tokenService.clear();
        patchState(store, {
          username: '',
          roles: [],
          isAuthenticated: false,
          error: '',
          sessionTimedOut: timedOut,
        });
        if (navigateToLogin) {
          await router.navigate(['/auth/login'], {
            queryParams: timedOut ? { reason: 'session-expired' } : undefined,
          });
        }
      },

      touchSession(): void {
        if (store.isAuthenticated()) resetTimer();
      },
    };

    return methods;
  }),
  withHooks((store) => ({
    onInit(): void {
      if (typeof window === 'undefined') return;
      const touch = () => store.touchSession();
      ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach((evt) =>
        window.addEventListener(evt, touch, { passive: true })
      );
    },
  }))
);

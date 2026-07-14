import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiFacadeService } from '../core/services/api-facade.service';
import { TokenService } from '../core/services/token.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ApiFacadeService);
  private readonly tokenService = inject(TokenService);

  readonly username = signal('');
  readonly roles = signal<string[]>([]);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly canViewClinical = computed(() =>
    this.roles().some((role) => role.includes('DOCTOR') || role.includes('ADMIN'))
  );

  async login(username: string, password: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');
    try {
      const tokens = await firstValueFrom(this.api.login({ username, password }));
      this.tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
      const profile = await firstValueFrom(this.api.currentUser());
      this.username.set(profile.username);
      this.roles.set(profile.roles);
      this.isAuthenticated.set(true);
    } catch {
      this.tokenService.clear();
      this.error.set('Authentication failed');
      this.isAuthenticated.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  async hydrateFromToken(): Promise<void> {
    if (!this.tokenService.accessToken) {
      this.reset();
      return;
    }

    this.isLoading.set(true);
    try {
      const profile = await firstValueFrom(this.api.currentUser());
      this.username.set(profile.username);
      this.roles.set(profile.roles);
      this.isAuthenticated.set(true);
    } catch {
      this.tokenService.clear();
      this.reset();
    } finally {
      this.isLoading.set(false);
    }
  }

  logout(): void {
    this.tokenService.clear();
    this.reset();
  }

  private reset(): void {
    this.username.set('');
    this.roles.set([]);
    this.isAuthenticated.set(false);
    this.error.set('');
  }
}




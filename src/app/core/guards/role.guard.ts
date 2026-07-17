import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../state/auth.store';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  const assignedRoles = authStore.roles();

  // During initial app bootstrap, roles may still be loading from /auth/me.
  if (assignedRoles.length === 0 && !!tokenService.accessToken) {
    return true;
  }

  const hasRole = assignedRoles.some(
    (role: string) => requiredRoles.includes(role.replace('ROLE_', '')) || requiredRoles.includes(role)
  );

  if (hasRole) {
    return true;
  }

  return router.createUrlTree(['/error/403']);
};

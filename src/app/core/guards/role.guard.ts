import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../state/auth.store';

export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject<any>(AuthStore);
  const router = inject(Router);
  const requiredRoles = (route.data['roles'] as string[] | undefined) ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  const hasRole = authStore
    .roles()
    .some((role: string) => requiredRoles.includes(role.replace('ROLE_', '')) || requiredRoles.includes(role));
  if (hasRole) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};




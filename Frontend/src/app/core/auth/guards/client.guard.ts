import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ClientAuthService } from '../services/client-auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(ClientAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Check if token exists in query params (direct link login)
  const token = route.queryParams['token'];
  if (token) {
    return router.parseUrl(`/client/login?token=${token}`);
  }

  return router.parseUrl('/client/login');
};

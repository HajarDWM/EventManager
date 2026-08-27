import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

import { CatererService } from '../../services/caterer.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const catererService = inject(CatererService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const cachedProfile = catererService.currentProfile();
  const targetUrl = state.url || '';
  const isAllowedForSuspended = targetUrl.includes('/subscription') || targetUrl.includes('/profile');

  if (cachedProfile) {
    // Expiration does not block app navigation; user remains logged in in Read-Only / Restricted mode
    const isSuspended = cachedProfile.accountStatus === 'SUSPENDED';
    if (isSuspended) {
      if (isAllowedForSuspended) {
        return true;
      }
      router.navigate(['/subscription']);
      return false;
    }
    return true;
  }

  return catererService.getCurrentProfile().pipe(
    map(profile => {
      const isSuspended = profile && profile.accountStatus === 'SUSPENDED';
      if (isSuspended) {
        if (isAllowedForSuspended) {
          return true;
        }
        router.navigate(['/subscription']);
        return false;
      }
      return true;
    }),
    catchError((err) => {
      authService.logout();
      if (err.status === 403 && err.error?.error === 'ACCOUNT_PENDING_APPROVAL') {
        router.navigate(['/pending-approval']);
      } else {
        router.navigate(['/login']);
      }
      return of(false);
    })
  );
};

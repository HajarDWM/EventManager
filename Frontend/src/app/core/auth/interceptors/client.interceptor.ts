import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClientAuthService } from '../services/client-auth.service';

export const clientInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ClientAuthService);
  const token = authService.getToken();

  // Only attach the client token for API calls specific to the client
  if (token && req.url.includes('/api/v1/client/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Ajouter l'en-tête Authorization avec le token JWT uniquement pour les appels API internes (non-client)
  const isApiRequest = req.url.startsWith('/api/') || (req.url.includes('/api/') && !req.url.startsWith('http'));
  const isClientRoute = req.url.includes('/api/v1/client/');

  if (token && isApiRequest && !isClientRoute) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

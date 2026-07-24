import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur n'est pas connecté, il peut accéder aux pages d'authentification
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si l'utilisateur est déjà connecté, on le redirige vers la liste des événements
  router.navigate(['/events']);
  return false;
};

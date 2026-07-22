import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CatererService } from '../../services/caterer.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const catererService = inject(CatererService);
  const router = inject(Router);

  // Vérifier si le profil est déjà chargé en mémoire
  const cachedProfile = catererService.currentProfile();
  if (cachedProfile) {
    if (cachedProfile.role === 'SUPER_ADMIN') {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  }

  // Sinon, récupérer le profil depuis l'API REST
  return catererService.getCurrentProfile().pipe(
    map(profile => {
      if (profile && profile.role === 'SUPER_ADMIN') {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};

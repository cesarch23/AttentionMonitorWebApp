import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const allowedRoles = route.data['roles'] as string[];

  const userRole = tokenService.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }
  router.navigate(['/auth/login']);
  notification.show('No tiene permiso para acceder a esta pagina.','warning');
  return false;
};

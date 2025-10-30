import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  if(tokenService.isValidToken()) return true;
  else {
    notificationService.show("La sesión se cerró automáticamente por inactividad. Vuelva a iniciar sesión", 'warning');
    router.navigate(['/auth/login'])
    return false;
  }
};

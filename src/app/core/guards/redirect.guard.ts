import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const redirectGuard: CanActivateFn = (route, state) => {
   const tokenService = inject(TokenService);
 
  const router = inject(Router);
  if(tokenService.isValidToken())
  {
    const userRole = tokenService.getUserRole();
     
    if(!userRole) return true; // If no role is found, allow access to the route
    if (userRole === 'PROFESOR') {
      router.navigate(['/admin/home']);
    } else if (userRole === 'ESTUDIANTE') {
      router.navigate(['/estudiante/home']);
    } 
    return false;
  }
  //router.navigate(['/auth/login'])
  return true;
};

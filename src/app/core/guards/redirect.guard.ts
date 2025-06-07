import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const redirectGuard: CanActivateFn = (route, state) => {
   const tokenService = inject(TokenService);
   console.log('redirect:');
  const router = inject(Router);
  if(tokenService.isValidToken())
  {
    const userRole = tokenService.getUserRole();
    console.log('User role:', userRole);
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

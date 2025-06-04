import { HttpContextToken, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export const CACHING_ENABLED = new HttpContextToken<boolean>(()=>true);

export function setCachingEnabled(){
  return new HttpContextToken<boolean>(()=>false)
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  if(!req.context.get(CACHING_ENABLED)){
    const isValidToken = tokenService.isValidToken();
    if(isValidToken){
      const token = tokenService.getToken();
      if(token){
        const newRequest = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        })
        return next(newRequest);
      }
      else{
        authService.logout();
        // Return an unauthorized response instead of the request
        return of(new HttpResponse({
          status: 401,
          statusText: 'Unauthorized'
        }));
      }
    } 
  }
  return next(req);
};

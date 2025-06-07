import { HttpContext, HttpContextToken, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, of, tap, throwError } from 'rxjs';

export const CACHING_ENABLED = new HttpContextToken<boolean>(()=>true);
export const EXPECT_TOKEN_IN_RESPONSE = new HttpContextToken<boolean>(() => false);

export function setCachingEnabled(){
  return new HttpContext().set(CACHING_ENABLED, false);
}
export function expectToken() {
  return new HttpContext().set(EXPECT_TOKEN_IN_RESPONSE, true);
}
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const shouldExpectToken = req.context.get(EXPECT_TOKEN_IN_RESPONSE);

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
        return of(new HttpResponse({
          status: 401,
          statusText: 'Unauthorized'
        }));
      }
    }
  
  }
  return next(req).pipe(
    tap(event => {
      if (shouldExpectToken && event instanceof HttpResponse) {
        const token = event.headers.get('Authorization');
        if (!token) {
          throw new Error('Token ausente en la respuesta');
        }
      }
    }),
    catchError(err => {
      return throwError(() => err);
    })
  );
};

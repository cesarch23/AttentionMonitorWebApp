import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviroment } from '../../../environments/environment';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { UserRegister } from '../models/model.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private BASE_URL = enviroment.BASE_URL;

  constructor(
    private http: HttpClient,
    private tokenService:TokenService,
    private router:Router

  ) { }

  login(email:string, password:string){
    return this.http.post(`${this.BASE_URL}/auth/login`,{email,password},{observe:'response'})
    .pipe(
      tap({
        next:(resp)=>{
          const token = resp.headers.get('Authorization');
          if(token)
            this.tokenService.saveToken(token)
        }
      }),
      catchError((error:HttpErrorResponse)=>{
          if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. Verifica tu correo y contraseña'))
          }
          return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
        }
      )

    )
  }
  register(userRegister:UserRegister){
    return this.http.post(`${this.BASE_URL}/auth/login`,userRegister)
    .pipe(
      catchError((error:HttpErrorResponse)=>{
        if(error.status === HttpStatusCode.Conflict){
          return throwError(()=> new Error('Ya se registro el email'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      }
      )
    )
  }
  registerAndLogin(userRegister:UserRegister){
    return this.register(userRegister)
    .pipe(
      switchMap(()=>this.login(userRegister.email,userRegister.password))
    )
  }
  logout(){
    this.tokenService.removeToken();
    this.router.navigate(['/auth/login'])
  }

}

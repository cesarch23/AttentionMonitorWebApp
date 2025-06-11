import { HttpClient, HttpContext, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, signal, ɵsetCurrentInjector } from '@angular/core';
import { enviroment } from '../../../environments/environment';
import { catchError, Observable, of, retry, switchMap, tap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { Course, Gender, StudentProfile, TeacherProfile, UpdatePassword, UserRegister, UserUpdate } from '../models/model.interface';
import { Router } from '@angular/router';
import { EXPECT_TOKEN_IN_RESPONSE, setCachingEnabled } from '../interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private teacherSignal = signal<TeacherProfile | null>(null);
  private studentSignal = signal<StudentProfile | null>(null);

  teacherProfile$ = this.teacherSignal.asReadonly();
  studentProfile$ = this.studentSignal.asReadonly();

  private BASE_URL = enviroment.BASE_URL;

  constructor(
    private http: HttpClient,
    private tokenService:TokenService,
    private router:Router

  ) { }

  login(email:string, password:string){
    return this.http.post(`${this.BASE_URL}/auth/login`,{email,password}, {
      context: new HttpContext().set(EXPECT_TOKEN_IN_RESPONSE,true),
      observe:'response'
    })
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
    return this.http.post(`${this.BASE_URL}/auth/register`,userRegister)
    .pipe(
      catchError((error:HttpErrorResponse)=>{
        if(error.status === HttpStatusCode.Conflict){
          return throwError(()=> new Error('Ya se registro el email'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
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
    this.teacherSignal.set(null);
    this.studentSignal.set(null);
    this.router.navigate(['/auth/login'])
  }
  // getProfile(){
  //   const token = this.tokenService.getToken();
  //   if(!token) return throwError(()=> new Error('Rol de usuario no reconocido'));
  //   const role = this.tokenService.getUserRole();
  //   if(role==='ESTUDIANTE')
  //     return this.getStudentProfile()
  //   else if(role==='PROFESOR')
  //     return this.getTeacherProfile();
  //   else
  //     return throwError(()=> new Error('Rol de usuario no reconocido'));
  // }
  getTeacherProfile(): Observable<TeacherProfile> {
     return this.http.get<TeacherProfile>(`${this.BASE_URL}/profesores/profile`,{context: setCachingEnabled()})
      .pipe(
        retry(2),
        tap(profile=> {
           this.teacherSignal.update(()=>profile)
          }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => new Error('Ups algo salió mal, inténtelo más tarde'));
        })
      );
  }
  refreshTeacherProfile(){
    const teacherId = this.teacherProfile$()?.teacherId;
    if(!teacherId){
      return this.getTeacherProfile();
    }
    return of(this.teacherProfile$());
  }
  getStudentProfile(){
    return this.http.get<StudentProfile>(`${this.BASE_URL}/estudiantes/profile`,{context: setCachingEnabled()})
      .pipe(
        retry(2),
        tap(profile=> {
          this.studentSignal.update(()=>profile)
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => new Error('Ups algo salió mal, inténtelo más tarde'));
        })
      );
  }
  updateTeacherProfile(userUpdate:UserUpdate,teacherId:string ='0'){
    return this.http.put<TeacherProfile>(`${this.BASE_URL}/profesores/${teacherId}`,userUpdate,{context: setCachingEnabled()})
      .pipe(
        tap(profile=> {
           this.teacherSignal.update(()=>profile)
          }),
        catchError((error: HttpErrorResponse) => {
          if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
          }
          if(error.status === HttpStatusCode.NotFound){
            return throwError(()=> new Error(error.message))
          }
          if(error.status === HttpStatusCode.Conflict){
            return throwError(()=> new Error(error.message))
          }
          return throwError(() => new Error('Ups algo salió mal, inténtelo más tarde'));
        })
      );
  }
  updateStudentProfile(userUpdate:UserUpdate,studentId:string ='0'){
    return this.http.put<StudentProfile>(`${this.BASE_URL}/estudiantes/${studentId}`,userUpdate,{context: setCachingEnabled()})
      .pipe(
        tap(profile=> {
           this.studentSignal.update(()=>profile)
          }),
        catchError((error: HttpErrorResponse) => {
          if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
          }
          if(error.status === HttpStatusCode.NotFound){
            return throwError(()=> new Error(error.message))
          }
          if(error.status === HttpStatusCode.Conflict){
            return throwError(()=> new Error(error.message))
          }
          return throwError(() => new Error('Ups algo salió mal, inténtelo más tarde'));
        })
      );
  }
  updateTeacherPassword(update: UpdatePassword,teacherId:string ='0'){
    return this.http.put<Boolean>(`${this.BASE_URL}/profesores/password/${teacherId}`,update,{context: setCachingEnabled()})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
          }
          if(error.status === HttpStatusCode.NotFound){
            return throwError(()=> new Error(error.message))
          }
          return throwError(() => new Error('Ups algo salió mal, inténtelo más tarde'));
        })
      );
  }


  

}

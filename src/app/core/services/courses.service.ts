import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { enviroment } from '../../../environments/environment';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { Course } from '../models/model.interface';
import { catchError, retry, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${enviroment.BASE_URL}/cursos`;

  private coursesSignal = signal<Course[]>([]);
  courses$ = this.coursesSignal.asReadonly()

  constructor() { }

   getCoursesByTeacherId() {
    const teacherId = this.authService.teacherProfile$()?.teacherId;
    console.log("geacher id",teacherId)
    return this.http.get<Course[]>(`${this.url}/${teacherId}`, { context: setCachingEnabled() })
    .pipe(
      retry(1),
      tap((courses)=>{
        this.coursesSignal.update(()=>[...courses])
        console.log(" curssos service ",courses)
      }),
      catchError((error:HttpErrorResponse)=>{
        if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. Verifica tu correo y contraseña'))
          }
          return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
        }
      )
      
    );
  }
}

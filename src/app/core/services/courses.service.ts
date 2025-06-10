import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { enviroment } from '../../../environments/environment';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { Course } from '../models/model.interface';
import { catchError, Observable, retry, switchMap, tap, throwError } from 'rxjs';

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
    if(!teacherId){
      return this.authService.getTeacherProfile()
      .pipe(
        switchMap(profile=> this.sendRequest(profile.teacherId))
      )
    }
    return this.sendRequest(teacherId);
    
   }
  private sendRequest(teacherId:string){
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
  addCourse(course:{name:string} ): Observable<Course>{
    const { name } = course;
    const teacherId = this.authService.teacherProfile$()!.teacherId;
    if(!teacherId){
      return this.authService.getTeacherProfile().pipe(
        switchMap((teacher)=>  this.sendRequestToAdd({name , teacherId: teacher.teacherId } ) ) 
      )
    }
    return this.sendRequestToAdd({name,teacherId});
  }
  updateCourse(name:string, courseId:string ): Observable<Course>{
    return this.http.put<Course>(`${this.url}/${courseId}`,{name},{context:setCachingEnabled()}).pipe(
      retry(1),
      tap(course=>this.coursesSignal.update((courses)=>[...courses,course])),
      catchError((error:HttpErrorResponse)=>{
        if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. Verifica tu correo y contraseña'))
          }
          return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde')) 
        }
      )
    );
  }
  deleteCourse(courseId:string){
    return this.http.delete<Boolean>(`${this.url}/${courseId}`,{context:setCachingEnabled()}).pipe(
      retry(1),
      tap(isDeleted=>{
        if(isDeleted)
          this.coursesSignal.update((courses)=>[...courses.filter(c => c.courseId !== courseId)])
      }),
      catchError((error:HttpErrorResponse)=>{
        if(error.status === HttpStatusCode.Unauthorized){
            return throwError(()=> new Error('Credenciales inválidas. Verifica tu correo y contraseña'))
          }
        if(error.status === HttpStatusCode.Conflict){
            return throwError(()=> new Error('No se pudo eliminar,el curso tiene sesiones asociadas'))
          }
          return throwError(()=> new Error('Ups algo salio mal. No se pudo eliminar,intentelo más tarde')) 
        }
      )
    );
  }

  private sendRequestToAdd(courseSend: {teacherId:string,name:string}) : Observable<Course>{
    return this.http.post<Course>(`${this.url}`,courseSend,{context:setCachingEnabled()}).pipe(
      retry(1),
      tap(course=>this.coursesSignal.update((courses)=>[...courses,course])),
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

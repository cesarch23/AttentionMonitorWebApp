import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { enviroment } from '../../../environments/environment';
import { Session, SessionRegister, TeacherProfile } from '../models/model.interface';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { BehaviorSubject, catchError, retry, switchMap, tap, throwError } from 'rxjs';
import { getDurationInMinutes } from '../../shared/utils/time-range.validator';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${enviroment.BASE_URL}/sesiones`;

  private sessionsSignal = signal<Session[]>([]); // Adjust the type as needed
  sessions$ = this.sessionsSignal.asReadonly();

  constructor() { }
  getSessionsByTeacherId() {
    const teacherId = this.authService.teacherProfile$()?.teacherId;
    if(!teacherId){
      return this.authService.getTeacherProfile()
      .pipe(
        switchMap(profile=>{
          return this.http.get<Session[]>(`${this.url}/profesor/${profile.teacherId}`, { context: setCachingEnabled() })
            .pipe(
              tap((sessions: Session[]) => {
                this.sessionsSignal.update(()=>sessions); 
              }),
              catchError((error:HttpErrorResponse)=>{
                if(error.status === HttpStatusCode.Unauthorized){
                  return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
                }
                return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
              })
            );
        })
      );
    }
    return this.http.get<Session[]>(`${this.url}/profesor/${teacherId}`, { context: setCachingEnabled() })
            .pipe(
              tap((sessions: Session[]) => {
                this.sessionsSignal.update(()=>sessions); 
              }),
              catchError((error:HttpErrorResponse)=>{
                if(error.status === HttpStatusCode.Unauthorized){
                  return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
                }
                return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
              })
            );
    
  }
  add(session:SessionRegister){
    const sessionDuration = getDurationInMinutes(session.startHours, session.endHours)
    const date = DateTime.fromJSDate(session.date).toFormat('yyyy-MM-dd');
    console.log("sesion para agregar",session,date)
     return this.http.post<Session>(`${this.url}`,{...session,sessionDuration,date},{ context:setCachingEnabled() }).pipe(
      tap((session: Session) => {
        this.sessionsSignal.update((current)=> [...current,session]); 
      }),
      catchError((error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
    );
  }
}

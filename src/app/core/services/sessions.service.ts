import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Session, SessionRegister, TeacherProfile } from '../models/model.interface';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { BehaviorSubject, catchError, Observable, retry, switchMap, tap, throwError } from 'rxjs';
import { getDurationInMinutes } from '../../shared/utils/time-range.validator';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${environment.BASE_URL}/sesiones`;

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
                if(error.status === HttpStatusCode.Forbidden){
                  return throwError(()=> new Error('No tiene permiso para ver la información'))
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
                if(error.status === HttpStatusCode.Forbidden){
                  return throwError(()=> new Error('No tiene permiso para ver la información'))
                }
                return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
              })
            );
    
  }
  add(session:SessionRegister){
    const sessionDuration = getDurationInMinutes(session.startHours, session.endHours)
    const date = DateTime.fromJSDate(session.date).toFormat('yyyy-MM-dd');
 
     return this.http.post<Session>(`${this.url}`,{...session,sessionDurationMinutes:sessionDuration,date},{ context:setCachingEnabled() }).pipe(
      tap((session: Session) => {
        this.sessionsSignal.update((current)=> [...current,session]); 
      }),
      catchError((error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
        }
        if(error.status === HttpStatusCode.Forbidden){
          return throwError(()=> new Error('No tiene permiso para ver la información'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
    );
  }
  updateSesion(session:SessionRegister,sessionId:string){
     return this.http.put<Session>(`${this.url}/${sessionId}`,{...session},{ context:setCachingEnabled() }).pipe(
      tap((session: Session) => {
        this.sessionsSignal.update((current)=> [...current,session]); 
      }),
      catchError((error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
        }
        if(error.status === HttpStatusCode.Forbidden){
          return throwError(()=> new Error('No tiene permiso para ver la información'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
    );
  }
  deleteSesion(sessionId:string):Observable<Boolean>{
     return this.http.delete<Boolean>(`${this.url}/${sessionId}`,{ context:setCachingEnabled() }).pipe(
      tap((deleted) => {
        if(deleted)
            this.sessionsSignal.update((sessions)=>[...sessions.filter(s => s.sessionId !== sessionId)])
      }),
      catchError((error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
        }
        if(error.status === HttpStatusCode.Forbidden){
          return throwError(()=> new Error('No tiene permiso para ver la información'))
        }
        if(error.status === HttpStatusCode.Conflict){
            return throwError(()=> new Error('No se pudo eliminar,la sesion tiene registros asociados'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
    );
  }
  getSessionById(sessionId:string):Observable<Session>{
     return this.http.get<Session>(`${this.url}/${sessionId}`,{ context:setCachingEnabled() }).pipe(
      catchError((error)=>{
        if(error.status === HttpStatusCode.Unauthorized){
          return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
        }
        if(error.status === HttpStatusCode.Forbidden){
          return throwError(()=> new Error('No tiene permiso para ver la información'))
        }
        if(error.status === HttpStatusCode.NotFound){
            return throwError(()=> new Error('La sesion aun no fue creada'))
        }
        if(error.status === HttpStatusCode.BadRequest){
            return throwError(()=> new Error('No se pudo conectar. Verifica el codigo de la sesión'))
        }
        return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
      })
    );
  }

}

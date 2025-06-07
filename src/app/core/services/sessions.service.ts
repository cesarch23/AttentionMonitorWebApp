import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { enviroment } from '../../../environments/environment';
import { Session } from '../models/model.interface';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { catchError, tap, throwError } from 'rxjs';

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
    const teacherId = this.authService.teacherProfile$()!.teacherId || '0'; 
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
}

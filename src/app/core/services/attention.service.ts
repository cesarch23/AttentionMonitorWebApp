import { Injectable } from '@angular/core';

import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { TokenService } from './token.service';
import { catchError, Observable, throwError } from 'rxjs';
import { AbsentChart, Attention, LineChart, PhoneLineChart } from '../models/model.interface';
import { setCachingEnabled } from '../interceptors/token.interceptor';
import { AuthService } from './auth.service';
import { AttentionInfo } from '../../student/pages/home/home.component';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttentionService {
  

  private url = `${environment.BASE_URL}/atenciones`
  
  constructor(
      private http: HttpClient,
      private authService: AuthService
      //private tokenService:TokenService,
      //private router:Router
  ) { }
  getUsePhoneLineChart(sessionId:string):Observable<PhoneLineChart>{
    return this.http.get<PhoneLineChart>(`${this.url}/phone-use/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getSomnolenceLineChart(sessionId:string):Observable<LineChart>{
    return this.http.get<LineChart>(`${this.url}/somnolence/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAbsentChart(sessionId:string):Observable<number[]>{
    return this.http.get<number[]>(`${this.url}/ausencia/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAttentionAvrgChart(sessionId:string):Observable<LineChart>{
    return this.http.get<LineChart>(`${this.url}/promedio/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAttentionMultitaskingDetails(sessionId:string):Observable<Attention[]>{
    return this.http.get<Attention[]>(`${this.url}/phone-use-details/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAttentionSomnolenceDetails(sessionId:string):Observable<Attention[]>{
    return this.http.get<Attention[]>(`${this.url}/somnolence-details/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAttentionAbsentDetails(sessionId:string):Observable<Attention[]>{
    return this.http.get<Attention[]>(`${this.url}/ausentes-details/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  getAttentionDetails(sessionId:string):Observable<Attention[]>{
    return this.http.get<Attention[]>(`${this.url}/${sessionId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  conectToSesion(sessionId:string):Observable<boolean>{
    const studentId = this.authService.studentProfile$()?.studentId
    return this.http.get<boolean>(`${this.url}/conect/${sessionId}/${studentId}`,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            if(error.status === HttpStatusCode.Conflict){
              return throwError(()=> new Error('La sesion alcanzo al limite de conectados'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }
  registerAttention(payload:AttentionInfo):Observable<AttentionInfo>{
    return this.http.post<AttentionInfo>(`${this.url}`,payload,{ context:setCachingEnabled() }).pipe(
          catchError((error)=>{
            if(error.status === HttpStatusCode.Unauthorized){
              return throwError(()=> new Error('Credenciales inválidas. vuelve a iniciar sesión'))
            }
            if(error.status === HttpStatusCode.Conflict){
              return throwError(()=> new Error('La sesion alcanzo al limite de conectados'))
            }
            return throwError(()=> new Error('Ups algo salio mal, intentelo más tarde'))
          })
        );
  }




}

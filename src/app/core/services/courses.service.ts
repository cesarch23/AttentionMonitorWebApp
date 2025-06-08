import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { enviroment } from '../../../environments/environment';
import { setCachingEnabled } from '../interceptors/token.interceptor';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private url = `${enviroment.BASE_URL}/cursos`;

  constructor() { }

   getCoursesByTeacherId() {
    const teacherId = this.authService.teacherProfile$()?.teacherId;
    return this.http.get(`${this.url}/${teacherId}`, { context: setCachingEnabled() });
  }
}

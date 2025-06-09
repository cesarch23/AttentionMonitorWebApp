import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SessionsService } from '../../../core/services/sessions.service';
import { RequestStatus, Session } from '../../../core/models/model.interface';
import { filter, map, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { TeacherNavbarComponent } from "../../components/navbar/navbar.component";
import { SessionsTableComponent } from "../../components/sessions-table/sessions-table.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../../components/session-dialog/session-dialog.component';

@Component({
  selector: 'app-sessions-by-course',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    SessionsTableComponent,
  ],
  templateUrl: './sessions-by-course.component.html',
  styleUrl: './sessions-by-course.component.css'
})
export class SessionsByCourseComponent implements OnInit {

  authServ = inject(AuthService);
  sessionServ =  inject(SessionsService)
  notification = inject(NotificationService);
  route = inject(ActivatedRoute);
    private dialog = inject(MatDialog);

  courseId:string | null = null;
  teacher$ = this.authServ.teacherProfile$;
  sessions: Session[] = [];
  // sessions = this.sessionServ.sessions$;
  sessionStatus:RequestStatus = 'init';
  courseName = signal<string | null>(null)
  constructor(){
    
  }

  ngOnInit(): void {
    
    this.route.paramMap.pipe(
      map(param=>param.get('courseId') || '0'),
      switchMap( (courseId) => {  
        this.sessionStatus = 'loading';
        this.courseId = courseId;
        if(this.teacher$())
          this.courseName.update(()=> this.teacher$()!.courses.find(c=> c.courseId === courseId)!.name )
        return this.sessionServ.getSessionsByTeacherId()
      })
    ).subscribe({
          next: (sessions) => {
            this.sessionStatus = 'success';
            // this.sessions = sessions.filter(sesion=>sesion.course.courseId===this.courseId);
            this.sessions = sessions;
          },
          error: (messageError) => {
            this.sessionStatus = 'failed';
            this.notification.show("Ups ocurrio error, intente más tarde",'error');
          },
          complete: ()=>{
            this.sessionStatus = 'init'
          }
    })
  }

  openToAddSessionDialog(){
    this.dialog.open(SessionDialogComponent,{
      data:{
        title:'Agregar sesión',
        isEdit:false
      }
    })
  }



}

import { AfterViewInit, Component, effect, inject, Input, input, OnInit, signal, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Session } from '../../../core/models/model.interface';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import { DurationPipe } from '../../../core/pipes/duration.pipe';
import { SessionStatusPipe } from '../../../core/pipes/session-status.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from '../session-dialog/session-dialog.component';
import { DatePipe } from '@angular/common';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { DeleteSessionDialogComponent } from '../delete-session-dialog/delete-session-dialog.component';


@Component({
  selector: 'teacher-sessions-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltip,
    MatButtonModule,
    MatSort,
    MatSortModule,
    DurationPipe,
    SessionStatusPipe,
    DatePipe,
  ],
  templateUrl: './sessions-table.component.html',
  styleUrl: './sessions-table.component.css'
})
export class SessionsTableComponent implements AfterViewInit,OnInit {

  sessions = input<Session[]>([])
  filter = input<boolean>(false)
  courseId = input<string>("")
  sessionColumns = ['sessionId','course','description','date','startHours', 'duracion','estado','numberStudentConected','acciones'] 
  private dialog = inject(MatDialog);
  sessionDataSource = new MatTableDataSource<Session>()
  
  constructor(){
    console.log("iniciando el componente de la tabla",this.sessions())
    effect(() => {
      const sessions = this.sessions();     
      const filter = this.filter();       
      const courseId = this.courseId();
      const filtered = filter
        ? sessions.filter(session => session.course.courseId === courseId)
        : sessions;

      this.sessionDataSource.data = [...filtered];
    });
  }
  ngOnInit(): void {
    
  }
  @ViewChild(MatPaginator) paginator?: MatPaginator
  @ViewChild(MatSort) sort?:MatSort
 
  ngAfterViewInit(): void {
    this.sessionDataSource.paginator = this.paginator ? this.paginator : null;
    this.sessionDataSource.sort= this.sort ? this.sort : null;
     this.sessionDataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'course':
        return item.course.name;
      default:
        return (item as any)[property];
    }
  };
  }
  openToEditSessionDialog(session:Session){
    const { 
      sessionId,course,date,
      description,endHours,
      numberStudentConected,
      sessionDurationMinutes,
      startHours } = session;
    this.dialog.open(SessionDialogComponent,{
      data: {
         sessionId: sessionId,
         description:description,
         startHours:startHours,
         endHours:endHours,
         sessionDurationMinutes:sessionDurationMinutes,
         date:date,
         numberStudentConected:numberStudentConected,
         course:course,
         title:'Actualizar sesión',
         isEdit:true
      }
    }).afterClosed().subscribe((result: { session?:Session;updated:boolean; inserted:boolean}={inserted:false,updated:false})=>{
        if(result.updated && result.session){
          console.log('updatesd resul',result)
           
          const updatedSession = result.session;
          const updatedSessions = this.sessions().map(s =>{
                if(s.sessionId === updatedSession.sessionId){
                  s = {...updatedSession}
                }
                return s;
              }
            );
            this.sessionDataSource.data = structuredClone(updatedSessions);
          // this.sessions = [result.session,...pastSession]
        }
    })
    
  }
  deleteSession(session:Session){
    this.dialog.open(DeleteSessionDialogComponent,{data:{session}}).afterClosed().subscribe((result: {delete:boolean}={delete:false})=>{
        if(result.delete){
             this.sessionDataSource.data = this.sessionDataSource.data.filter(s=>s.sessionId!==session.sessionId)
          }
      });
  }
  

}

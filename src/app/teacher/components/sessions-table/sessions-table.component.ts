import { AfterViewInit, Component, inject, input, signal, ViewChild } from '@angular/core';
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
import { SessionsService } from '../../../core/services/sessions.service';


@Component({
  selector: 'teacher-sessions-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltip,
    MatButtonModule,
    MatSortModule,
    DurationPipe,
    SessionStatusPipe,
    
  ],
  templateUrl: './sessions-table.component.html',
  styleUrl: './sessions-table.component.css'
})
export class SessionsTableComponent implements AfterViewInit {

  // sessions = input<Session[]>([])
  
  filter = input<boolean>(false)
  courseId = input<string>("")
  sessionColumns = ['codigo','curso','nombre','fechaCreacion','duracion','estado','cantidadAlumnoConectados','acciones'] 
  private dialog = inject(MatDialog);
  private sessionServ = inject(SessionsService);
  
  sessions = this.sessionServ.sessions$
  sessionDataSource = new MatTableDataSource<Session>( this.sessions() )
  
  constructor(){
   
  }
  ngOnInit(): void {
    if(this.filter()){
      this.sessionDataSource.data = this.sessions().filter(sesion=>sesion.course.courseId===this.courseId());
      console.log("sesiones ", this.sessionDataSource.data)
    }else{
      this.sessionDataSource.data = this.sessions()
      console.log("sesiones ", this.sessionDataSource.data)
    }
  }
  @ViewChild('MatPaginator2') paginator?: MatPaginator
  @ViewChild(MatSort) sort?:MatSort

  ngAfterViewInit(): void {
    this.sessionDataSource.paginator = this.paginator ? this.paginator : null;
    this.sessionDataSource.sort= this.sort ? this.sort : null;
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
    })
    
  }
  

}

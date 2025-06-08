import { AfterViewInit, Component, input, ViewChild } from '@angular/core';
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

  sessions = input<Session[]>([])
  sessionColumns = ['codigo','curso','nombre','fechaCreacion','duracion','estado','cantidadAlumnoConectados','acciones'] 
  sessionDataSource = new MatTableDataSource<Session>( this.sessions() )

  constructor(){
    console.log("recibido de sesiones",this.sessions())
  }
  ngOnInit(): void {
     this.sessionDataSource.data = this.sessions()
  }
  @ViewChild('MatPaginator2') paginator?: MatPaginator
  @ViewChild(MatSort) sort?:MatSort

  ngAfterViewInit(): void {
    this.sessionDataSource.paginator = this.paginator ? this.paginator : null;
    this.sessionDataSource.sort= this.sort ? this.sort : null;
  }

}

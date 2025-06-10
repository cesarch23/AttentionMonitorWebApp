import { Component, inject, OnInit } from '@angular/core';
import { SessionsService } from '../../../core/services/sessions.service';
import { RequestStatus, Session } from '../../../core/models/model.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SessionsTableComponent } from "../../components/sessions-table/sessions-table.component";
import { SessionDialogComponent } from '../../components/session-dialog/session-dialog.component';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    SessionsTableComponent,
],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.css'
})
export class SessionsComponent implements OnInit {
  sessionStatus:RequestStatus = 'init';
  private sessionServ = inject(SessionsService)
  private notification = inject(NotificationService)
  private dialog = inject(MatDialog);
  sessions:Session[] = []
  
  constructor(){
    console.log("iniciado la session componente")
  }
  
  ngOnInit(): void {
     this.sessionStatus = 'loading';
    this.sessionServ.getSessionsByTeacherId().subscribe({
          next: (sessions) => {
            this.sessionStatus = 'success';
            this.sessions = structuredClone(sessions)
          },
          error: (messageError) => {
            this.sessionStatus = 'failed';
            this.notification.show(messageError,'error');
          }
    })
  }

   openToAddSessionDialog(){
      this.dialog.open(SessionDialogComponent,{
        data:{
          title:'Agregar sesión',
          isEdit:false
        }
      }).afterClosed().subscribe((result: { session?:Session;updated:boolean; inserted:boolean}={inserted:false,updated:false})=>{
        if(result.inserted && result.session){
          const pastSession= structuredClone(this.sessions)
          this.sessions = [result.session,...pastSession]
        }
      })
    }

}

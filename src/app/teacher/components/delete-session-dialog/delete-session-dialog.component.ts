import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RequestStatus, Session } from '../../../core/models/model.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { SessionsService } from '../../../core/services/sessions.service';

@Component({
  selector: 'app-delete-session-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule 
  ],
  templateUrl: './delete-session-dialog.component.html',
  styles: ``
})
export class DeleteSessionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteSessionDialogComponent>);
  readonly data = inject<{session:Session}>(MAT_DIALOG_DATA);
  private notificationServ = inject(NotificationService)
  private sessionServ = inject(SessionsService);
  sessionRequestStatus:RequestStatus = 'init'
   
  delete(){
    this.sessionRequestStatus = 'loading'
    this.sessionServ.deleteSesion(this.data.session.sessionId).subscribe({
      next:(isDeleted =>{
        this.sessionRequestStatus = 'success'
        if(isDeleted){
          this.notificationServ.show('La sesión fue eliminada','success')
          this.dialogRef.close({delete:true})
        }
        else {
          this.notificationServ.show('No se pudo eliminar la sesión','error')
        }
      }),
      error:(errorMessage)=>{
        this.sessionRequestStatus = 'failed'
        this.notificationServ.show(errorMessage,'error')
      },
      complete:()=>this.sessionRequestStatus = 'init'
    })


    
  }


}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { CourseService } from '../../../core/services/courses.service';
import { Course, RequestStatus } from '../../../core/models/model.interface';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule 
  ],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.css'
})
export class DeleteDialogComponent {
      readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
      readonly data = inject<{course:Course}>(MAT_DIALOG_DATA);
      private notificationServ = inject(NotificationService)
      private courseServ = inject(CourseService);
      courseRequestStatus:RequestStatus = 'init'
 
      delete(){
        this.courseRequestStatus = 'loading'
        this.courseServ.deleteCourse(this.data.course.courseId).subscribe({
          next:(deleted =>{
            this.courseRequestStatus = 'success'
            this.notificationServ.show('El curso fue eliminado','success')
            this.dialogRef.close({delete:true})
          }),
          error:(errorMessage)=>{
            this.courseRequestStatus = 'failed'
            this.notificationServ.show(errorMessage,'error')
          },
          complete:()=>this.courseRequestStatus = 'init'
        })
       
         
  
      }
  

}

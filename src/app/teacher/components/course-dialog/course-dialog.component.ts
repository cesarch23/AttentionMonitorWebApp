import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { Course, RequestStatus } from '../../../core/models/model.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { CourseService } from '../../../core/services/courses.service';
import { MatInput, MatInputModule } from '@angular/material/input';

@Component({
  selector: 'tacher-course-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInputModule,
    MatDialogModule 
   ],
  templateUrl: './course-dialog.component.html',
  styleUrl: './course-dialog.component.css'
})
export class CourseDialogComponent implements OnInit {
    readonly dialogRef = inject(MatDialogRef<CourseDialogComponent>);
    readonly data = inject<{course?:Course, title:string, isEdit:boolean}>(MAT_DIALOG_DATA);
    private notificationServ = inject(NotificationService)
    private courseServ = inject(CourseService);
    courseRequestStatus:RequestStatus = 'init'

    courseForm:FormGroup = new FormGroup({
      name:new FormControl<string | null>(null,[Validators.required,Validators.minLength(3)])
    })

    ngOnInit(): void {
        if(this.data.isEdit){
          this.courseForm.reset({name:this.data.course?.name})
           
        }
    }

    sendSession(){
      this.courseForm.markAllAsTouched()
      if(this.courseForm.invalid) return;
      this.courseRequestStatus = 'loading'
      const { name } = this.courseForm.getRawValue();
      if(this.data.isEdit){
        this.courseServ.updateCourse(name,this.data.course!.courseId).subscribe({
          next:(courseUpdated=>{
            this.courseRequestStatus = 'success'
            this.notificationServ.show('Se actualizo con exito el curso','success')
            this.courseForm.reset({name:null})
            this.dialogRef.close({course:courseUpdated,updated:true,inserted:false})
          }),
          error:(errorMessage)=>{
            this.courseRequestStatus = 'failed'
            this.notificationServ.show(errorMessage,'error')
          }
        })
      }
      else{
      
        this.courseServ.addCourse({name}).subscribe({
            next:(course)=>{
              this.courseRequestStatus = 'success'
              this.notificationServ.show('Se agrego con exito el curso','success')
              this.courseForm.reset({name:null})
              this.dialogRef.close({course,updated:false,inserted:true})
            },
            error:(errorMessage)=>{
              this.courseRequestStatus = 'failed'
              this.notificationServ.show(errorMessage,'error')
            },
            complete:()=>this.courseRequestStatus = 'init'

          })

        }

    }

}

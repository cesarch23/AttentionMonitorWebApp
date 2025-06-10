import { Component, inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { Course, RequestStatus, SessionDialogData, SessionRegister } from '../../../core/models/model.interface';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { timeRangeValidator } from '../../../shared/utils/time-range.validator';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DateTime } from 'luxon';
import { SessionsService } from '../../../core/services/sessions.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CourseService } from '../../../core/services/courses.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './session-dialog.component.html',
  styleUrl: './session-dialog.component.css'
})
export class SessionDialogComponent implements OnInit {
  
  sessionRquestStatus:RequestStatus = 'init'
  
  readonly dialogRef = inject(MatDialogRef<SessionDialogComponent>);
  readonly data = inject<SessionDialogData>(MAT_DIALOG_DATA);
  private sessionServ = inject(SessionsService)
  private notificationServ = inject(NotificationService)
  private courseServ = inject(CourseService);
  private router = inject(Router);
  courses = this.courseServ.courses$

  sessionForm:FormGroup = new FormGroup({
      description: new FormControl< null | string >(null,[Validators.required]),
      startHours: new FormControl< null | string >(null,[Validators.required]),
      endHours: new FormControl< null | string >(null,[Validators.required]),
      date: new FormControl< null | Date>(null,[Validators.required]), 
      courseId: new FormControl< null | string>(null,[Validators.required]), 
    },
    {
      validators: timeRangeValidator
    }
  )
  constructor(){
    this.courseServ.getCoursesByTeacherId().subscribe();
  }
  ngOnInit(): void {
    if(this.data.isEdit){
      this.initializeForm()
    }

  }
  initializeForm(){
      const { description,startHours,endHours,date,course, } = this.data
      this.sessionForm.reset({
        description:description,
        startHours:startHours,
        endHours:endHours,
        date: DateTime.fromISO(date!.toString()).toJSDate(),
        courseId:course?.courseId
      }) 
  }
  sendSession(){
    this.sessionForm.markAllAsTouched()
    if(this.sessionForm.invalid) return;
    this.sessionRquestStatus = 'loading'
    const {courseId,date,description,endHours,startHours } = this.sessionForm.getRawValue();
    if(this.data.isEdit){
        if(!this.data.sessionId) return;
        this.sessionServ.updateSesion(
        {
          description,
          date, 
          endHours, 
          sessionDurationMinutes:0,
          startHours,
          course:{courseId}
        },this.data.sessionId).subscribe({
          next:(session)=>{
            this.sessionRquestStatus = 'success'
            this.notificationServ.show('Se actualizo la sesion','success')
            this.dialogRef.close({session,updated:true,inserted:false})
            this.sessionForm.reset()
            this.router.navigateByUrl('admin/sesiones')
          },
          error:(errorMessage)=>{
            this.sessionRquestStatus = 'failed'
            this.notificationServ.show(errorMessage,'error')
          }

        })
    }
    else{
      this.sessionServ.add(
        {
          description,
          date, 
          endHours, 
          sessionDurationMinutes:0,
          startHours,
          course:{courseId}
        }).subscribe({
          next:(session)=>{
            this.sessionRquestStatus = 'success'
            this.notificationServ.show('Se agrego con exito la session','success')
            this.sessionForm.reset()
            this.dialogRef.close({session,updated:false,inserted:true})
            this.router.navigateByUrl('admin/sesiones')
          },
          error:(errorMessage)=>{
            this.sessionRquestStatus = 'failed'
            this.notificationServ.show(errorMessage,'error')
            
          }

        })

    }
  }
  
}

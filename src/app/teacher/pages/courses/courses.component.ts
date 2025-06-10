import { Component, inject } from '@angular/core';
import { Course, RequestStatus } from '../../../core/models/model.interface';
import { CourseService } from '../../../core/services/courses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CourseDialogComponent } from '../../components/course-dialog/course-dialog.component';
import { CourseTableComponent } from '../../components/course-table/course-table.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CourseTableComponent,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent {
    courseStatus:RequestStatus = 'init';
    courses:Course[] = []
    
    private courseServ = inject(CourseService)
    private notificationServ = inject(NotificationService)
    private dialog = inject(MatDialog);

    ngOnInit(): void {
      this.courseStatus = 'loading';
      this.courseServ.getCoursesByTeacherId().subscribe({
        next:(courses)=>{
          this.courseStatus = 'success'
          this.courses = structuredClone(courses)
        },
        error:(errorMessage)=>{
          this.courseStatus = 'failed'
          this.notificationServ.show(errorMessage,'error')
        }
      })
    }
  
    openToAddCourseDialog(){
        this.dialog.open(CourseDialogComponent,{
          data:{
            title:'Agregar curso',
            isEdit:false
          }
        }).afterClosed()
        .subscribe((result: { course?:Course;updated:boolean; inserted:boolean}={course:undefined,inserted:false,updated:false})=>{
          console.log("results recibidos",result.course)
          if(!result) return;
          if(result.inserted && result.course){
            const pastCourse= structuredClone(this.courses)
            this.courses = [result.course,...pastCourse]
          }
        })
      }

}

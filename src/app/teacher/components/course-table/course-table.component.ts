import { AfterViewInit, Component, effect, inject, input, ViewChild } from '@angular/core';
import { Course } from '../../../core/models/model.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CourseDialogComponent } from '../course-dialog/course-dialog.component';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'teacher-course-table',
  standalone: true,
  imports: [
      MatTableModule,
      MatPaginatorModule,
      MatIconModule,
      MatTooltip,
      MatButtonModule,
      MatSortModule,
  ],
  templateUrl: './course-table.component.html',
  styleUrl: './course-table.component.css'
})
export class CourseTableComponent implements AfterViewInit {
    courses$ = input<Course[]>([])
    
    courseColumns = ['name','acciones'] 
    private dialog = inject(MatDialog);
    courseDataSource = new MatTableDataSource<Course>()
    
    constructor(){
      console.log("iniciando el componente de la tabla course")
      
      effect(() => {
        const courses$ = this.courses$();     
        this.courseDataSource.data = [...courses$];
      }); 
    }

    @ViewChild(MatPaginator) paginator?: MatPaginator
    @ViewChild(MatSort) sort?:MatSort
   
    ngAfterViewInit(): void {
      this.courseDataSource.paginator = this.paginator ? this.paginator : null;
      this.courseDataSource.sort= this.sort ? this.sort : null;
        
    }
    openToEditCourseDialog(course:Course){
 
      this.dialog.open(CourseDialogComponent,{
        data: {
           course:course,
           title:'Actualizar sesión',
           isEdit:true
        }
      }).afterClosed().subscribe((result: { course?:Course;updated:boolean; inserted:boolean}={course:undefined,inserted:false,updated:false})=>{
        if(!result) return;
        if(result.updated && result.course){
            const updatedCourse = result.course;
            const updatedCourses = this.courses$().map(course =>
              course.courseId === updatedCourse.courseId
                ? { ...course, name: updatedCourse.name }
                : course
            );
            this.courseDataSource.data = structuredClone(updatedCourses);
          }
      });
      
    }
    openDeleteDialog(course:Course){
      this.dialog.open(DeleteDialogComponent,{
        data: {
           course:course
        }
      }).afterClosed().subscribe((result: {delete:boolean}={delete:false})=>{
         
        if(result.delete){
             this.courseDataSource.data = this.courseDataSource.data.filter(c=>c.courseId!==course.courseId)
            //delete table
          }
      });
    }
}

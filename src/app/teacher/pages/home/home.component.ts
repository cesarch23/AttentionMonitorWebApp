import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../../core/services/courses.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private authServ = inject(AuthService);
  private courseServ = inject(CourseService);
  teacher$ = this.authServ.teacherProfile$;
  courses$ = this.courseServ.courses$

  ngOnInit(): void {
     this.courseServ.getCoursesByTeacherId().subscribe();
  }
  
  



}

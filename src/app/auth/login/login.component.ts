import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { RequestStatus } from '../../core/models/model.interface';
import {MatTabsModule} from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { whitespaceValidator } from '../../shared/utils/whitespace.validator';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  statusFormStudent:RequestStatus = 'init';
  statusFormTeacher:RequestStatus = 'init';
  tabIsDisable:boolean = false;
 
  private notificationServ = inject( NotificationService );
  private router = inject(Router);
  private authService = inject(AuthService)

  constructor(){}
  
   loginFormStudent: FormGroup = new FormGroup({
    email: new FormControl<null | string>(null, [Validators.required,whitespaceValidator(), Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
    password: new FormControl < null | string > (null, [Validators.required,Validators.minLength(8), Validators.maxLength(20)]),
  })
   loginFormTeacher: FormGroup = new FormGroup({
    email: new FormControl<null | string>(null, [Validators.required,whitespaceValidator(), Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
    password: new FormControl < null | string > (null, [Validators.required,Validators.minLength(8), Validators.maxLength(20)]),
  })
 
  
  onSubmitStudent(){
    this.loginFormStudent.markAllAsTouched();
    if(this.loginFormStudent.invalid)
      return;
    this.tabIsDisable = true;
    const {email,password } = this.loginFormStudent.getRawValue();
    this.statusFormStudent = 'loading';
    this.authService.login(email,password).subscribe({
        next:()=>{
          this.router.navigateByUrl('/estudiante/home')
           this.loginFormStudent.reset(); 
        },
        error:(errorMessage)=> {
          this.notificationServ.show(errorMessage,'error');
          this.statusFormStudent = 'failed';
          this.tabIsDisable = false;
        },
        complete:()=> {
          this.statusFormStudent = 'init'
          this.tabIsDisable = false;
        }
      });
     

  }
   
  onSubmitTeacher(){
    this.loginFormTeacher.markAllAsTouched();
    if(this.loginFormTeacher.invalid)
      return;
    this.tabIsDisable = true;
    const {email,password } = this.loginFormTeacher.getRawValue();
    this.statusFormTeacher = 'loading';
    this.authService.login(email,password).subscribe({
        next:()=>{
          this.router.navigateByUrl('/admin/home')
          this.loginFormTeacher.reset();
        },
        error:(errorMessage)=> {
          this.notificationServ.show(errorMessage,'error');
          this.statusFormTeacher = 'failed';
          this.tabIsDisable = false;
        },
        complete:()=> {
          this.statusFormTeacher = 'init';
          this.tabIsDisable = false;
        }
      });
      
  }
}

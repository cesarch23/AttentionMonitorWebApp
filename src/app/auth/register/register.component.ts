import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { RequestStatus } from '../../core/models/model.interface';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { whitespaceValidator } from '../../shared/utils/whitespace.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule,
    RouterLink,
    MatSelectModule

  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    statusFormStudent:RequestStatus = 'init';
    statusFormTeacher:RequestStatus = 'init';
    tabIsDisable:boolean = false;
    private notificationServ = inject( NotificationService );
    private router = inject(Router);
    private authService = inject(AuthService)
  
    constructor(){}
    
     registerFormStudent: FormGroup = new FormGroup({
      email: new FormControl<null | string>(null, [Validators.required ,Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
      name: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      maternalLastname: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      paternalLastname: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      gender: new FormControl<null | string>(null, [Validators.required]),
      password: new FormControl < null | string > (null, [Validators.required,whitespaceValidator(),Validators.minLength(8), Validators.maxLength(20)]),
    })
     registerFormTeacher: FormGroup = new FormGroup({
      email: new FormControl<null | string>(null, [Validators.required, Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
      name: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      maternalLastname: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      paternalLastname: new FormControl<null | string>(null, [Validators.required, whitespaceValidator()]),
      gender: new FormControl<null | string>(null, [Validators.required]),
      password: new FormControl < null | string > (null, [Validators.required, whitespaceValidator(),Validators.minLength(8), Validators.maxLength(20)])
    })
  
    onSubmitStudent(){
      this.registerFormStudent.markAllAsTouched();
      if(this.registerFormStudent.invalid)
        return;
      this.tabIsDisable = true;
      const {email,password,name,maternalLastname,paternalLastname,gender }  = this.registerFormStudent.getRawValue();
      this.statusFormStudent = 'loading';
      this.authService.registerAndLoginStudent({email,password,name,maternalLastname,paternalLastname,gender })
      .subscribe({
          next:()=>{
            this.router.navigateByUrl('/estudiante/home')
            // this.registerFormStudent.reset(); 
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
      this.registerFormTeacher.markAllAsTouched();
      if(this.registerFormTeacher.invalid)
        return;
      this.tabIsDisable = true;
      const {email,password,name,maternalLastname,paternalLastname,gender } = this.registerFormTeacher.getRawValue();
      this.statusFormTeacher = 'loading';
      this.authService.registerAndLoginTeacher({email,password,name,maternalLastname,paternalLastname,gender})
        .subscribe({
          next:()=>{
            this.router.navigateByUrl('/admin/home')
            // this.registerFormTeacher.reset();
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

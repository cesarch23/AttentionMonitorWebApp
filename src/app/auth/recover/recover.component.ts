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

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {
  statusFormStudent:RequestStatus = 'init';
  statusFormVerified:RequestStatus = 'init';
  statusUpdatePasswordForm:RequestStatus = 'init';
  tabIsDisable:boolean = false;
  
  userEmailVerified:boolean = false;
  userCodeVerified:boolean = false;

  private notificationServ = inject( NotificationService );
  private router = inject(Router);
  private authService = inject(AuthService)

  loginFormStudent: FormGroup = new FormGroup({
    email: new FormControl<null | string>(null, [Validators.required, Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
  })
  userFormVerified : FormGroup = new FormGroup({
    email: new FormControl<null | string>(null, [Validators.required, Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
    code: new FormControl<null | number>(null, [Validators.required, Validators.min(1000), Validators.max(9999)]),
    
  })
  updatePasswordForm : FormGroup = new FormGroup({
    email: new FormControl<null | string>(null, [Validators.required, Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
    password: new FormControl<null | string>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
    
  })
  
  //step 1
  verifyStudentEmail(){
    this.loginFormStudent.markAllAsTouched();
    if(this.loginFormStudent.invalid) return;
    const {email } = this.loginFormStudent.getRawValue();
  
    this.statusFormStudent = 'loading';
    this.authService.sendRecoverEmailAndSentEmail(email).subscribe({
        next:(isEmailSent:boolean)=>{
         
          this.userEmailVerified = isEmailSent;
          if(!isEmailSent){
            this.notificationServ.show("No se pudo enviar el código, intentelo más tarde",'warning');
            this.statusFormStudent = 'failed';
          }
          else{
            this.userFormVerified.setValue({email,code:null})
            this.updatePasswordForm.setValue({email,password:null})
            this.statusFormStudent = 'success'
            this.notificationServ.show("Revisa tu correo e ingresa tu codigo de verificacion ",'success');
          }
        },
        error:(errorMessage)=> {
          this.notificationServ.show(errorMessage,'error');
          this.statusFormStudent = 'failed';
        },
        complete:()=> this.statusFormStudent = 'init'
      });
     

  }
  verifyStudentCode(){
    this.userFormVerified.markAllAsTouched();
    if(this.userFormVerified.invalid) return;
    const {email,code } = this.userFormVerified.getRawValue();
    
    this.statusFormVerified = 'loading';
    this.authService.verifyUserCode(email,code).subscribe({
        next:(isCodeVerified:boolean)=>{
         
          this.userCodeVerified = isCodeVerified;

          if(!isCodeVerified){
            this.notificationServ.show("El codigo es incorrecto",'warning');
            this.statusFormVerified = 'failed';
          }
          else{
            this.statusFormVerified = 'success'
            this.notificationServ.show("El codigo es correcto",'success');
          }
        },
        error:(errorMessage)=> {
          this.notificationServ.show(errorMessage,'error');
          this.statusFormVerified = 'failed';
        },
        complete:()=> this.statusFormVerified = 'init'
      });
     
  }
  updatePassword(){
    this.updatePasswordForm.markAllAsTouched();
    if(this.updatePasswordForm.invalid) return;
    const {email,password } = this.updatePasswordForm.getRawValue();
    
    this.statusUpdatePasswordForm = 'loading';
    this.authService.udpdatePassword(email,password).subscribe({
        next:(isUpdated:boolean)=>{
          console.log("updated ",isUpdated)
          if(isUpdated){
            this.notificationServ.show("Contraseña actualizada",'success');
            this.statusUpdatePasswordForm = 'success';
          }
          else{
            this.statusUpdatePasswordForm = 'failed'
            this.notificationServ.show("No se pudo actualizar la contraseña, intentalo más tarde",'error');
          }
          this.router.navigateByUrl('/auth/login')
        },
        error:(errorMessage)=> {
          this.notificationServ.show(errorMessage,'error');
          this.statusUpdatePasswordForm = 'failed';
        },
        complete:()=> this.statusUpdatePasswordForm = 'init'
      });
     
  }
 
}

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Gender, RequestStatus, StudentProfile } from '../../../core/models/model.interface';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {
    userFormStatus:RequestStatus = 'init'
    passwordFormStatus:RequestStatus = 'init'
    authServ = inject(AuthService)
    notificationServ = inject(NotificationService)
  
    userForm:FormGroup = new FormGroup({
      name: new FormControl<string | null>(null,[Validators.required]),
      maternalLastname: new FormControl<string | null>(null,[Validators.required]),
      paternalLastname: new FormControl<string | null>(null,[Validators.required]),
      email: new FormControl<string | null>(null,[Validators.required, Validators.email]),
      gender: new FormControl<Gender | null>(null,[Validators.required]),
    })
    passwordForm:FormGroup = new FormGroup({
      current: new FormControl<string | null>(null,[Validators.required, Validators.maxLength(32)]),
      novel: new FormControl<string | null>(null,[Validators.required, Validators.maxLength(32)]),
    })
    ngOnInit(): void {
        this.authServ.refreshStudentProfile().subscribe(profile=>{
          if(profile){
            this.initializeUserForm(profile)
          }
        }) 
    }
    private initializeUserForm( user:StudentProfile ){
      const { name, maternalLastname, paternalLastname, email, gender} = user 
       this.userForm.reset({
              name,
              maternalLastname,
              paternalLastname,
              email,
              gender
            })
    }
  
    updateProfile(){
      this.userForm.markAllAsTouched();
      if(this.userForm.invalid) return;
      this.userFormStatus = 'loading';
      const { name,maternalLastname,paternalLastname,email,gender } = this.userForm.getRawValue();
      this.authServ.updateStudentProfile({
        name,
        maternalLastname,
        paternalLastname,
        email,
        gender
      }, this.authServ.studentProfile$()?.studentId).subscribe({
        next:(profile)=>{
          this.notificationServ.show("se actualizo de forma exitosa",'success')
          this.userFormStatus = 'success';
          this.initializeUserForm(profile)
        },
        error:(messageError)=>{
          this.notificationServ.show(messageError,'error')
          this.userFormStatus = 'failed';
        }
      })
      
    }
    updatePassword(){
      this.passwordForm.markAllAsTouched();
      if(this.passwordForm.invalid) return;
      this.passwordFormStatus = 'loading';
      const { current,novel  } = this.passwordForm.getRawValue();
      this.authServ.updateStudentPassword({current,novel}, this.authServ.studentProfile$()?.studentId).subscribe({
        next:(isUpdated)=>{
          this.passwordFormStatus = 'success';
          if(isUpdated){
            this.notificationServ.show("Su contraseña se actualizo de forma exitosa, vuelva a iniciar sesión",'success')
            this.passwordForm.reset()
            this.authServ.logout()
          }
          else this.notificationServ.show("Error de autenticación. Verifica tu contraseña actual",'error')
        },
        error:(messageError)=>{
          this.notificationServ.show(messageError,'error')
          this.passwordFormStatus = 'failed';
        }
      })
    }
  
}

import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Gender, RequestStatus, TeacherProfile } from '../../../core/models/model.interface';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { whitespaceValidator } from '../../../shared/utils/whitespace.validator';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit{

  userFormStatus:RequestStatus = 'init'
  passwordFormStatus:RequestStatus = 'init'
  authServ = inject(AuthService)
  notificationServ = inject(NotificationService)

  userForm:FormGroup = new FormGroup({
    name: new FormControl<string | null>(null,[Validators.required, whitespaceValidator()]),
    maternalLastname: new FormControl<string | null>(null,[Validators.required, whitespaceValidator()]),
    paternalLastname: new FormControl<string | null>(null,[Validators.required, whitespaceValidator()]),
    email: new FormControl<string | null>(null,[Validators.required, Validators.pattern(/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/)]),
    gender: new FormControl<Gender | null>(null,[Validators.required]),
  })
  passwordForm:FormGroup = new FormGroup({
    current: new FormControl<string | null>(null,[Validators.required, whitespaceValidator(),Validators.minLength(8), Validators.maxLength(20)]),
    novel: new FormControl<string | null>(null,[Validators.required, whitespaceValidator(),Validators.minLength(8), Validators.maxLength(20)]),
  })
  ngOnInit(): void {
      this.authServ.refreshTeacherProfile().subscribe(profile=>{
        if(profile){
          this.initializeUserForm(profile)
        }
      }) 
  }
  private initializeUserForm( user:TeacherProfile ){
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
    this.authServ.updateTeacherProfile({
      name,
      maternalLastname,
      paternalLastname,
      email,
      gender
    }, this.authServ.teacherProfile$()?.teacherId).subscribe({
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
    this.authServ.updateTeacherPassword({current,novel}, this.authServ.teacherProfile$()?.teacherId).subscribe({
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

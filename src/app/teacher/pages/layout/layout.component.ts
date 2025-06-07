import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TeacherNavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, TeacherNavbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authServ = inject(AuthService);
  constructor(){
    this.authServ.getProfile().subscribe();
  }
  ngOnDestroy(): void {
    this.authServ.logout();
  }

}

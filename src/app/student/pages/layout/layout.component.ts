import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterOutlet,
    
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private authServ = inject(AuthService);
  constructor(){
      this.authServ.getStudentProfile().subscribe();
  }
}

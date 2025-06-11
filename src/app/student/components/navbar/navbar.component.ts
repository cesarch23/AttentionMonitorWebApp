import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgClass } from '@angular/common';

@Component({
  selector: 'student-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    MatToolbarModule,
    MatTabsModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
   private authServ = inject(AuthService);
   student = this.authServ.studentProfile$;
  
    showMenu = false;
    toggleNavbar(){
      this.showMenu = !this.showMenu;
    }
    logout() {
      this.authServ.logout();
    }
}

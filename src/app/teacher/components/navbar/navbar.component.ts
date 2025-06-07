import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { NgClass } from '@angular/common';


@Component({
  selector: 'teacher-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    RouterLinkActive,
    MatToolbarModule,
    MatTabsModule,
    MatButtonModule,
    MatMenuModule,
    NgClass
  ],
  //exportAs:[TeacherNavbarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class TeacherNavbarComponent {
  private authServ = inject(AuthService);
  teacher = this.authServ.teacherProfile$;

  showMenu = false;
  toggleNavbar(){
    this.showMenu = !this.showMenu;
  }
  logout() {
    this.authServ.logout();
  }
}

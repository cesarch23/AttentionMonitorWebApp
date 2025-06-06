import { NgClass } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import  { MAT_SNACK_BAR_DATA, MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar'
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MatSnackBarModule,NgClass,MatIconModule,MatButtonModule],
  template: `
    <div class="custom-snackbar" [ngClass]="data.type">
      <div>
        <mat-icon [fontIcon]="data.icon" ></mat-icon>
        <span class="message" matSnackBarLabel >{{ data.message }}</span>
      </div>
      <button mat-stroked-button matSnackBarAction aria-label="close notification" (click)="snackBarRef.dismissWithAction()"   > Ok </button>
    </div>
  `,
  styles: [`
    
     ::ng-deep .mat-mdc-snack-bar-container .mat-mdc-snackbar-surface{
        margin:0 !important;
        padding:0 !important;
      }
    .custom-snackbar {
      display: flex;
      align-items: center;
      justify-content:space-between;
      gap: 10px;
      padding:2px 8px;
      margin: 0;
      border-radius: 4px;
      
    }
    .custom-snackbar.info{
      background-color:#0b6fc1;
    }
    .custom-snackbar.error{
      background-color:  #c1170b;
    }
    .custom-snackbar.success{
      background-color: #38803A;
    }
    .custom-snackbar.warning{
      background-color:  #C1810B;
    }
    .custom-snackbar div {
      display:flex;
      align-items:center;

    }
    .custom-snackbar .message {
      font-size: 14px;
      color: #fff;
      font-family: 'Roboto', sans-serif;
    }
    .custom-snackbar mat-icon {
      font-size: 20px;
      text-align: center;
    }
    .custom-snackbar.success button  { color:#dbf0dc;  }
    .custom-snackbar.error button    { color:#FFE4DB;  }
    .custom-snackbar.info button { color:#E8F4FD;  }
    .custom-snackbar.warning button { color:  #FEF9F1;  }

  `]
})
export class NotificationComponent {
  snackBarRef = inject(MatSnackBarRef)
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string, type: string, icon: string }) {}

}

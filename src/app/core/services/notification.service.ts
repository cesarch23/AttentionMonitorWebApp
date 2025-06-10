import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private matSnackBar = inject(MatSnackBar) 
  constructor() { }

   show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', durationSeg = 5) {
    let icon: 'info' | 'warning' | 'error' | 'check' = 'info';
    
    if(type === 'success') icon = 'check';
    if(type === 'error') icon = 'error';
    if(type === 'info') icon = 'info';
    if(type === 'warning') icon = 'warning';

    this.matSnackBar.openFromComponent(NotificationComponent, {
      data: { message, type, icon },
      duration: durationSeg*1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['custom-snackbar-panel']
    });
  }
}

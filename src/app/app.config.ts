import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
 

const CUSTOM_FORMAT = {
  parse: {
    dateInput: 'dd MMM yyyy',
  },
  display: {
    dateInput: 'dd MMM yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd MMM yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue:CUSTOM_FORMAT },
    { provide: MAT_DATE_LOCALE,useValue:'es-PE' },
  ]
};

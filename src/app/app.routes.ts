import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard'
import { redirectGuard } from './core/guards/redirect.guard';

export const routes: Routes = [
    {
        path: 'auth',
        canActivate: [redirectGuard],
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'estudiante',
        canActivate: [authGuard, roleGuard],
        loadChildren: () => import('./student/student.routes').then(m => m.STUDENT_ROUTES),
        data: {
            roles: ['ESTUDIANTE']
        }
    },
    {
        path: 'admin',
        canActivate: [authGuard,roleGuard],
        loadChildren: () => import('./teacher/teacher.routes').then(m => m.TEACHER_ROUTES),
        data: {
            roles: ['PROFESOR']
        }
    },
    {
        path: '**',
        redirectTo: 'auth'
    }
];

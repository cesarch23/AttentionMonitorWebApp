import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard'

export const routes: Routes = [
    {
        path: 'auth',
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
        canActivate: [authGuard,roleGuard],
        path: 'admin',
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

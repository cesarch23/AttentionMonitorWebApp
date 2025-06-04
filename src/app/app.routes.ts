import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'student',
        loadChildren: () => import('./student/student.routes').then(m => m.STUDENT_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () => import('./teacher/teacher.routes').then(m => m.TEACHER_ROUTES)
    },
    {
        path: '**',
        redirectTo: 'auth'
    }
];

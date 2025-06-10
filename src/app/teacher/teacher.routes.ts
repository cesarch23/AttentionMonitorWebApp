import { Routes } from "@angular/router";
import { LayoutComponent } from "./pages/layout/layout.component";
import { roleGuard } from "../core/guards/role.guard";
import { authGuard } from "../core/guards/auth.guard";
import { HomeComponent } from "./pages/home/home.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { SessionsComponent } from "./pages/sessions/sessions.component";
import { CoursesComponent } from "./pages/courses/courses.component";

export const TEACHER_ROUTES: Routes = [

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                canActivate: [authGuard],
                component: HomeComponent
            },
            {
                path: 'dashboard',
                canActivate: [authGuard],
                component: DashboardComponent
            },
            {
                path: 'sesiones',
                canActivate: [authGuard],
                loadComponent: ()=> import('./pages/sessions/sessions.component').then(m=>m.SessionsComponent) 
            },
            {
                path: 'sesiones/:courseId',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/sessions-by-course/sessions-by-course.component").then(m => m.SessionsByCourseComponent)
            },

            {
                path: 'cursos',
                canActivate: [authGuard],
                component: CoursesComponent,
                
            },
            {
                path: 'cuenta',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/account/account.component").then(m => m.AccountComponent)
            },
            {
                path: '**',
                redirectTo: 'home' // Redirect any unknown paths to home
            }
        ]
    }
    

]
import { Routes } from "@angular/router";
import { LayoutComponent } from "./pages/layout/layout.component";

export const TEACHER_ROUTES: Routes = [

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                loadComponent: () => import("./pages/home/home.component").then(m => m.HomeComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import("./pages/dashboard/dashboard.component").then(m => m.DashboardComponent)
            },
            {
                path: 'sesiones',
                loadComponent: () => import("./pages/sessions/sessions.component").then(m => m.SessionsComponent)
            },
            {
                path: 'cursos',
                loadComponent: () => import("./pages/courses/courses.component").then(m => m.CoursesComponent)
            },
            {
                path: 'cuenta',
                loadComponent: () => import("./pages/account/account.component").then(m => m.AccountComponent)
            },
            {
                path: '**',
                redirectTo: 'home' // Redirect any unknown paths to home
            }
        ]
    }
    

]
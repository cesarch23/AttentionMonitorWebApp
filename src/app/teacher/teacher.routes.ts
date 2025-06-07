import { Routes } from "@angular/router";
import { LayoutComponent } from "./pages/layout/layout.component";
import { roleGuard } from "../core/guards/role.guard";
import { authGuard } from "../core/guards/auth.guard";

export const TEACHER_ROUTES: Routes = [

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'home',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/home/home.component").then(m => m.HomeComponent)
            },
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/dashboard/dashboard.component").then(m => m.DashboardComponent)
            },
            {
                path: 'sesiones',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/sessions/sessions.component").then(m => m.SessionsComponent)
            },
            {
                path: 'cursos',
                canActivate: [authGuard],
                loadComponent: () => import("./pages/courses/courses.component").then(m => m.CoursesComponent)
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
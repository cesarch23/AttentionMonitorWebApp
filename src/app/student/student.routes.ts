import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { authGuard } from "../core/guards/auth.guard";
import { LayoutComponent } from "./pages/layout/layout.component";

export const STUDENT_ROUTES: Routes = [
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
   

];
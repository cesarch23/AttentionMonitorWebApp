import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { authGuard } from "../core/guards/auth.guard";

export const STUDENT_ROUTES: Routes = [
    {
        path: 'home',
        canActivate: [authGuard],
        component: HomeComponent
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

];
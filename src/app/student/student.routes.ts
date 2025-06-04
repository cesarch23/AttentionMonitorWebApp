import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";

export const STUDENT_ROUTES: Routes = [
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'cuenta',
        loadComponent: () => import("./pages/account/account.component").then(m => m.AccountComponent)
    },
    {
        path: '**',
        redirectTo: 'home' // Redirect any unknown paths to home
    }

];
import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    { path: 'register', loadComponent: () => import("./register/register.component").then(m => m.RegisterComponent) },
    { path: 'login', loadComponent: () => import("./login/login.component").then(m => m.LoginComponent) },
    { path: 'recover', loadComponent: () => import("./recover/recover.component").then(m => m.RecoverComponent) },
    { path: '**', redirectTo: 'login' } // Redirect any unknown paths to login
];
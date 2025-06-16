import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserRole } from '../../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('PublicGuard - isLoggedIn:', this.authService.isLoggedIn());
    
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUserValue;
      console.log('Usuário já logado:', user);
      
      // ✅ REDIRECIONAMENTO BASEADO NO ROLE
      switch (user?.role) {
        case UserRole.CLIENT:
          console.log('Redirecionando cliente para /cliente');
          return this.router.createUrlTree(['/cliente']);
          
        case UserRole.ADMIN:
          console.log('Redirecionando admin para /admin');
          return this.router.createUrlTree(['/admin']);
          
        case UserRole.SUPER_ADMIN:
          console.log('Redirecionando super admin para /admin');
          return this.router.createUrlTree(['/admin']); // ou /super-admin se preferir
          
        default:
          console.log('Role não identificado, redirecionando para home');
          return this.router.createUrlTree(['/']);
      }
    }
    
    console.log('Usuário não logado, permitindo acesso');
    return true;
  }
}
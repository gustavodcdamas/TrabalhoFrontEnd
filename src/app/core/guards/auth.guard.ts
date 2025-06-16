import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      this.authService.logout();
      return this.redirectToLogin(state.url);
    }

    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      return this.redirectToLogin(state.url, 'sessionExpired=true');
    }

    const currentUser = this.authService.currentUserValue;
    
    // Verificação opcional de email confirmado
    if (currentUser?.emailVerified === false) {
      return this.router.createUrlTree(['/auth/verify-email'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Verificação de roles
    const expectedRoles = route.data['expectedRoles'] as UserRole[];
    if (expectedRoles && !this.authService.hasAnyRole(expectedRoles)) {
      return this.router.createUrlTree(['/unauthorized']);
    }

    // Verificação opcional de conta desativada
    if (currentUser?.accountDisabled === true) {
      return this.router.createUrlTree(['/account-disabled']);
    }

    return true;
  }

  private redirectToLogin(returnUrl: string, extraParams = ''): UrlTree {
    const queryParams: { [key: string]: string } = { returnUrl };
    
    if (extraParams) {
      // Solução mais compatível com todas versões do TypeScript
      new URLSearchParams(extraParams).forEach((value, key) => {
        queryParams[key] = value;
      });
    }
    
    return this.router.createUrlTree(['/auth/login'], { queryParams });
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
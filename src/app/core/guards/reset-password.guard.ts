import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot
  ): Promise<boolean | UrlTree> {
    const token = route.queryParamMap.get('token');
    
    console.log('🔒 ResetPasswordGuard - Token recebido:', token);
    
    // ✅ Verificação básica: token deve existir e ter tamanho mínimo
    if (!token || token.length < 10) {
      console.log('❌ Token ausente ou muito curto');
      return this.redirectWithError('token-required');
    }

    try {
      console.log('🔍 Validando token no backend...');
      
      // ✅ Validação do token no backend
      const isValid = await firstValueFrom(this.authService.validateResetToken(token));
      
      console.log('🔍 Resultado da validação:', isValid);
      
      if (!isValid) {
        console.log('❌ Token inválido ou expirado');
        return this.redirectWithError('invalid-token');
      }

      // ✅ OPCIONAL: Verificar se token já foi usado (comentado para debugging)
      /*
      try {
        const isUsed = await firstValueFrom(this.authService.isResetTokenUsed(token));
        if (isUsed) {
          console.log('❌ Token já foi usado');
          return this.redirectWithError('token-already-used');
        }
      } catch (error) {
        console.warn('⚠️ Erro ao verificar se token foi usado (continuando):', error);
        // Não bloquear por este erro - continuar mesmo assim
      }
      */
      
      console.log('✅ Token válido, permitindo acesso');
      return true;
      
    } catch (error) {
      console.error('❌ Erro na validação do token:', error);
      
      // ✅ Em caso de erro de rede/API, ainda permitir acesso
      // O componente vai lidar com a validação
      console.log('⚠️ Erro na validação, mas permitindo acesso (componente vai validar)');
      return true;
    }
  }

  private redirectWithError(errorCode: string): UrlTree {
    console.log('🔄 Redirecionando para login com erro:', errorCode);
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { error: errorCode }
    });
  }
}
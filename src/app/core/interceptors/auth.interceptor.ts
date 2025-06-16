import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Adicione este debug no seu auth.interceptor.ts, no método intercept:

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔄 AuthInterceptor executado para:', request.method, request.url);
    
    // ✅ DEBUG COMPLETO
    const token = this.authService.token;
    const currentUser = this.authService.currentUserValue;
    
    console.log('🔍 Estado completo de autenticação:', {
      url: request.url,
      method: request.method,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NENHUM',
      isLoggedIn: this.authService.isLoggedIn(),
      currentUserEmail: currentUser?.email || 'NENHUM',
      currentUserToken: currentUser?.token ? 'SIM' : 'NÃO',
      localStorageAuth: localStorage.getItem('authToken') ? 'SIM' : 'NÃO',
      localStorageUser: localStorage.getItem('currentUser') ? 'SIM' : 'NÃO'
    });

    // URLs que não precisam de token JWT
    const publicUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/csrf-token',
      '/api/auth/check-email'
    ];

    const isPublicUrl = publicUrls.some(url => request.url.includes(url));
    const isGetInstitucional = request.method === 'GET' && request.url.includes('/api/institucional');

    console.log('🔍 Análise da URL:', {
      isPublicUrl,
      isGetInstitucional,
      shouldAddToken: !isPublicUrl && !isGetInstitucional
    });

    // ✅ Para rotas públicas ou GET institucional
    if (isPublicUrl || isGetInstitucional) {
      console.log('⏭️ Requisição pública - não adicionando JWT');
      const clonedRequest = request.clone({
        withCredentials: true
      });
      return next.handle(clonedRequest).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    // ✅ Para rotas protegidas, OBRIGATORIAMENTE adicionar JWT
    if (!token) {
      console.error('🚨 ERRO CRÍTICO: Token JWT não encontrado para rota protegida!');
      console.error('🔍 Detalhes do erro:', {
        url: request.url,
        authServiceToken: this.authService.token,
        currentUserValue: this.authService.currentUserValue,
        localStorageItems: {
          authToken: localStorage.getItem('authToken'),
          currentUser: localStorage.getItem('currentUser')
        }
      });
      
      this.authService.logout();
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('Token não encontrado'));
    }

    // ✅ Para métodos GET protegidos, apenas JWT
    if (request.method === 'GET') {
      console.log('✅ Adicionando JWT para GET protegido:', request.url);
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const clonedRequest = request.clone({
        headers,
        withCredentials: true
      });

      console.log('🔍 Headers da requisição final:', {
        hasAuthorization: clonedRequest.headers.has('Authorization'),
        authorizationValue: clonedRequest.headers.get('Authorization')?.substring(0, 20) + '...',
        allHeaders: clonedRequest.headers.keys()
      });

      return next.handle(clonedRequest).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    // ✅ Para métodos que modificam dados (POST, PUT, PATCH, DELETE)
    return this.authService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log('✅ Adicionando JWT + CSRF para:', request.method, request.url);
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        });

        const clonedRequest = request.clone({
          headers,
          withCredentials: true
        });

        console.log('🔍 Headers da requisição final (com CSRF):', {
          hasAuthorization: clonedRequest.headers.has('Authorization'),
          hasCSRF: clonedRequest.headers.has('X-CSRF-Token'),
          authorizationValue: clonedRequest.headers.get('Authorization')?.substring(0, 20) + '...',
          allHeaders: clonedRequest.headers.keys()
        });

        return next.handle(clonedRequest);
      }),
      catchError(this.handleError.bind(this))
    );
  }
  
  private handlePublicRequest(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Para requisições públicas, apenas adicionar CSRF se necessário
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return this.authService.getCsrfToken().pipe(
        switchMap(csrfToken => {
          const headers = new HttpHeaders({
            'X-CSRF-Token': csrfToken
          });

          const clonedRequest = request.clone({
            headers,
            withCredentials: true
          });

          return next.handle(clonedRequest);
        }),
        catchError(this.handleError.bind(this))
      );
    }

    // GET requests públicos - apenas withCredentials
    const clonedRequest = request.clone({
      withCredentials: true
    });

    return next.handle(clonedRequest).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleProtectedRequest(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token;
    
    if (!token) {
      console.error('🔒 Token JWT não encontrado para rota protegida');
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Token não encontrado'));
    }

    // ✅ Para requisições que modificam dados, adicionar CSRF
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return this.authService.getCsrfToken().pipe(
        switchMap(csrfToken => {
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken
          });

          const clonedRequest = request.clone({
            headers,
            withCredentials: true
          });

          console.log('🔐 Enviando requisição protegida com JWT e CSRF:', {
            method: request.method,
            url: request.url,
            hasJWT: !!token,
            hasCSRF: !!csrfToken
          });

          return next.handle(clonedRequest);
        }),
        catchError(this.handleError.bind(this))
      );
    }

    // ✅ Para GET protegidos, apenas JWT
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const clonedRequest = request.clone({
      headers,
      withCredentials: true
    });

    console.log('🔐 Enviando GET protegido com JWT:', {
      method: request.method,
      url: request.url,
      hasJWT: !!token
    });

    return next.handle(clonedRequest).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Erro HTTP interceptado:', {
      status: error.status,
      message: error.message,
      url: error.url
    });

    if (error.status === 401) {
      console.log('🔒 Token expirado ou inválido - fazendo logout');
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    if (error.status === 403) {
      console.log('🚫 CSRF token inválido ou expirado');
      // Você pode tentar renovar o CSRF token aqui se necessário
    }

    return throwError(() => error);
  }
}
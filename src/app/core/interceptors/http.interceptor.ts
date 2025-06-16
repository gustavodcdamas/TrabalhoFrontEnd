// src/app/core/interceptors/api-url.interceptor.ts
// Interceptor para gerenciar URLs da API dinamicamente

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { EnvironmentService } from '../../services/environment/environment.service';

@Injectable()
export class ApiUrlInterceptor implements HttpInterceptor {
  constructor(private environmentService: EnvironmentService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Verificar se é uma requisição para a API interna
    if (this.isInternalApiRequest(req.url)) {
      // Substituir URL base pela URL dinâmica
      const apiUrl = this.environmentService.apiUrl;
      const newUrl = req.url.replace(/^\/api/, `${apiUrl}/api`);
      
      const apiReq = req.clone({
        url: newUrl,
        setHeaders: {
          'Content-Type': 'application/json',
          'X-Frontend-Context': this.environmentService.runtimeEnvironment.contextInfo
        }
      });

      return next.handle(apiReq).pipe(
        retry(2), // Tentar novamente em caso de erro
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0 || error.status === 504) {
            // Erro de conectividade - tentar URL alternativa
            return this.retryWithFallbackUrl(req, next);
          }
          return throwError(error);
        })
      );
    }

    return next.handle(req);
  }

  private isInternalApiRequest(url: string): boolean {
    // Verificar se é uma requisição para a API interna
    return url.startsWith('/api') || 
           url.includes('agencia-backend') ||
           url.includes('localhost:3333');
  }

  private retryWithFallbackUrl(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.warn('Tentando URL alternativa para:', req.url);
    
    const fallbackUrl = this.environmentService.getFallbackApiUrl();
    const fallbackReq = req.clone({
      url: req.url.replace(this.environmentService.apiUrl, fallbackUrl)
    });

    return next.handle(fallbackReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Falha na conexão com backend:', error);
        return throwError(error);
      })
    );
  }
}
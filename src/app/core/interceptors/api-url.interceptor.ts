// src/app/core/interceptors/api-url.interceptor.ts
// Interceptor simplificado usando environment diretamente

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiUrlInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.log('🔍 INTERCEPTOR ATIVADO:', {
      originalUrl: req.url,
      environmentApiUrl: environment.apiUrl
    });

    // Verificar se é uma requisição para a API interna
    if (this.isInternalApiRequest(req.url)) {
      console.log('📡 Requisição API detectada:', req.url);
      
      // Substituir URL base pela URL do environment
      const apiUrl = environment.apiUrl;
      let newUrl = req.url;
      
      // Se a URL começar com /api, substituir por apiUrl/api
      if (req.url.startsWith('/api')) {
        newUrl = `${apiUrl}${req.url}`;
      }
      // Se já contém agencia-backend, substituir
      else if (req.url.includes('agencia-backend')) {
        newUrl = req.url.replace(/https?:\/\/agencia-backend:\d+/, apiUrl);
      }
      
      console.log('🔄 URL transformada:', {
        original: req.url,
        nova: newUrl,
        apiUrl: apiUrl
      });
      
      const apiReq = req.clone({
        url: newUrl,
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });

      return next.handle(apiReq).pipe(
        retry(1), // Tentar novamente em caso de erro
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Erro na requisição:', {
            url: newUrl,
            error: error.message,
            status: error.status
          });
          
          // Se der erro, tentar localhost como fallback
          if (error.status === 0 && !newUrl.includes('localhost')) {
            console.warn('🔄 Tentando fallback para localhost...');
            const fallbackReq = req.clone({
              url: req.url.replace(/https?:\/\/[^\/]+/, 'http://localhost:3333')
            });
            return next.handle(fallbackReq);
          }
          
          return throwError(error);
        })
      );
    }

    console.log('➡️ Requisição passando sem modificação:', req.url);
    return next.handle(req);
  }

  private isInternalApiRequest(url: string): boolean {
    const isInternal = url.startsWith('/api') || 
                      url.includes('agencia-backend') ||
                      url.includes('localhost:3333');
                      
    console.log('🤔 É requisição interna?', {
      url: url,
      isInternal: isInternal
    });
    
    return isInternal;
  }
}
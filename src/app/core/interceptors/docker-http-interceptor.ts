// =================================
// HTTP INTERCEPTOR OTIMIZADO PARA DOCKER
// =================================
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class DockerHttpInterceptor implements HttpInterceptor {
  private requestCount = 0;
  private failedRequests = new Set<string>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requestCount++;
    const requestId = `req_${this.requestCount}`;
    const startTime = Date.now();

    // ✅ Adicionar headers específicos para Docker
    const dockerReq = req.clone({
      setHeaders: {
        'X-Request-ID': requestId,
        'X-Client-Version': (environment as any).version || '1.0.0', // ✅ Corrigido com type assertion
        'X-Environment': environment.production ? 'production' : 'development',
        // ✅ Headers importantes para proxy reverso (nginx)
        'X-Forwarded-Proto': window.location.protocol.replace(':', ''),
        'X-Forwarded-Host': window.location.host,
        // ✅ Accept encoding para compressão
        'Accept-Encoding': 'gzip, deflate, br',
        // ✅ Keep-alive para reutilizar conexões TCP
        'Connection': 'keep-alive'
      }
    });

    if (!environment.production) {
      console.log(`🚀 [${requestId}] ${req.method} ${req.url}`);
    }

    return next.handle(dockerReq).pipe(
      // ✅ Timeout baseado no ambiente
      timeout(this.getTimeoutForRequest(req)),
      
      // ✅ Retry strategy para ambiente Docker
      retry({
        count: this.getRetryCount(req),
        delay: (error, retryCount) => {
          if (this.shouldRetry(error, req)) {
            const delay = this.calculateRetryDelay(retryCount, error);
            if (!environment.production) {
              console.log(`🔄 [${requestId}] Retry ${retryCount} em ${delay}ms`);
            }
            return timer(delay);
          }
          throw error;
        }
      }),
      
      // ✅ Log de resposta
      tap(event => {
        if (event.type === 4) { // HttpEventType.Response
          const duration = Date.now() - startTime;
          if (!environment.production) {
            console.log(`✅ [${requestId}] Concluído em ${duration}ms`);
          }
          
          // Remover da lista de falhas
          this.failedRequests.delete(req.url);
        }
      }),
      
      // ✅ Tratamento de erro específico para Docker
      catchError(error => this.handleDockerError(error, req, requestId))
    );
  }

  // ✅ Timeout baseado no tipo de request
  private getTimeoutForRequest(req: HttpRequest<any>): number {
    // Timeouts específicos para diferentes tipos de request
    if (req.url.includes('/upload') || req.method === 'POST' && req.body instanceof FormData) {
      return 120000; // 2 minutos para uploads
    }
    
    if (req.url.includes('/health') || req.url.includes('/csrf-token')) {
      return 10000; // 10 segundos para health checks
    }
    
    if (req.url.includes('viacep.com.br')) {
      return 15000; // 15 segundos para APIs externas
    }
    
    // Timeout padrão baseado no ambiente
    return (environment as any).requestTimeout || (environment.production ? 45000 : 30000);
  }

  // ✅ Quantidade de retry baseada no request
  private getRetryCount(req: HttpRequest<any>): number {
    // Não retry para requests de autenticação
    if (req.url.includes('/auth/') || req.url.includes('/login')) {
      return 0;
    }
    
    // Menos retry para uploads
    if (req.url.includes('/upload') || req.body instanceof FormData) {
      return 1;
    }
    
    // Mais retry para GET requests
    if (req.method === 'GET') {
      return 3;
    }
    
    return 2; // Padrão
  }

  // ✅ Decidir se deve fazer retry
  private shouldRetry(error: HttpErrorResponse, req: HttpRequest<any>): boolean {
    // Não retry para erros de cliente (4xx)
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Não retry para requests de autenticação
    if (req.url.includes('/auth/') || req.url.includes('/login')) {
      return false;
    }
    
    // Retry para erros de rede e servidor
    const retryableErrors = [0, 500, 502, 503, 504, 408, 429];
    return retryableErrors.includes(error.status);
  }

  // ✅ Calcular delay para retry
  private calculateRetryDelay(retryCount: number, error: HttpErrorResponse): number {
    // Delay maior para rate limiting
    if (error.status === 429) {
      return Math.pow(2, retryCount) * 5000; // 5s, 10s, 20s
    }
    
    // Delay exponencial padrão
    return Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
  }

  // ✅ Tratamento de erro específico para Docker
  private handleDockerError(error: HttpErrorResponse, req: HttpRequest<any>, requestId: string): Observable<never> {
    const duration = Date.now();
    this.failedRequests.add(req.url);
    
    let errorMessage = 'Erro desconhecido';
    let userFriendlyMessage = 'Erro desconhecido';
    
    // ✅ Classificar erros específicos do Docker
    switch (error.status) {
      case 0:
        errorMessage = 'Erro de conexão - Serviço indisponível';
        userFriendlyMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        this.logDockerConnectivityIssue(req.url);
        break;
        
      case 502:
        errorMessage = 'Bad Gateway - Proxy/Load Balancer erro';
        userFriendlyMessage = 'Erro temporário do servidor. Tente novamente em alguns instantes.';
        break;
        
      case 503:
        errorMessage = 'Service Unavailable - Container/Service down';
        userFriendlyMessage = 'Serviço temporariamente indisponível.';
        break;
        
      case 504:
        errorMessage = 'Gateway Timeout - Container não respondeu';
        userFriendlyMessage = 'O servidor demorou muito para responder. Tente novamente.';
        break;
        
      case 404:
        errorMessage = 'Endpoint não encontrado';
        userFriendlyMessage = 'Recurso não encontrado.';
        break;
        
      case 401:
        errorMessage = 'Não autorizado';
        userFriendlyMessage = 'Sessão expirada. Faça login novamente.';
        break;
        
      case 403:
        errorMessage = 'Acesso negado';
        userFriendlyMessage = 'Você não tem permissão para esta ação.';
        break;
        
      case 422:
        errorMessage = 'Dados de validação inválidos';
        userFriendlyMessage = error.error?.message || 'Dados inválidos.';
        break;
        
      case 429:
        errorMessage = 'Rate limit exceeded';
        userFriendlyMessage = 'Muitas requisições. Aguarde um momento e tente novamente.';
        break;
        
      default:
        if (error.status >= 500) {
          errorMessage = `Erro interno do servidor (${error.status})`;
          userFriendlyMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        } else {
          errorMessage = `Erro HTTP ${error.status}: ${error.message}`;
          userFriendlyMessage = error.error?.message || errorMessage;
        }
    }
    
    // ✅ Log estruturado para debugging Docker
    console.error(`❌ [${requestId}] ${errorMessage}`, {
      method: req.method,
      url: req.url,
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      isDockerEnvironment: this.isDockerEnvironment(),
      failedRequestsCount: this.failedRequests.size,
      timestamp: new Date().toISOString()
    });
    
    // ✅ Adicionar contexto Docker ao erro
    const enhancedError = new Error(userFriendlyMessage);
    (enhancedError as any).originalError = error;
    (enhancedError as any).dockerContext = {
      isDockerEnvironment: this.isDockerEnvironment(),
      apiUrl: environment.apiUrl,
      requestId: requestId
    };
    
    return throwError(() => enhancedError);
  }

  // ✅ Detectar se está em ambiente Docker
  private isDockerEnvironment(): boolean {
    return !environment.apiUrl.includes('localhost') && 
           (environment.apiUrl.includes('backend') || environment.production);
  }

  // ✅ Log específico para problemas de conectividade Docker
  private logDockerConnectivityIssue(url: string): void {
    if (this.isDockerEnvironment()) {
      console.error('🐳 [Docker] Problema de conectividade detectado:', {
        url: url,
        apiUrl: environment.apiUrl,
        suggestions: [
          'Verifique se o container do backend está rodando',
          'Verifique a configuração de rede do Docker',
          'Verifique se os serviços estão na mesma rede Docker',
          'Verifique se as portas estão expostas corretamente'
        ]
      });
    }
  }

  // ✅ Método para obter estatísticas de requests
  getRequestStats(): any {
    return {
      totalRequests: this.requestCount,
      failedUrls: Array.from(this.failedRequests),
      failedCount: this.failedRequests.size,
      isDockerEnvironment: this.isDockerEnvironment(),
      timestamp: new Date().toISOString()
    };
  }
}
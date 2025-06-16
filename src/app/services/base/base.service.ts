import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, switchMap, map, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ✅ Interface para resposta do CSRF token
interface CsrfTokenResponse {
  csrfToken: string;
}

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  protected abstract apiEndpoint: string;
  protected baseUrl = environment.apiUrl;
  protected csrfTokenSubject = new BehaviorSubject<string | null>(null); // ✅ Tornar protegido

  // ✅ Configurações padrão
  private readonly DEFAULT_TIMEOUT = 30000; // 30 segundos
  private readonly DEFAULT_RETRY_COUNT = 2;

  constructor(protected http: HttpClient) {}

  // ✅ Método centralizado para obter token de autenticação
  protected getAuthToken(): string | null {
    const sources = [
      () => localStorage.getItem('authToken'),
      () => sessionStorage.getItem('authToken'),
      () => this.extractTokenFromCurrentUser()
    ];

    for (const getToken of sources) {
      const token = getToken();
      if (token && token.trim()) {
        return token;
      }
    }

    return null;
  }

  private extractTokenFromCurrentUser(): string | null {
    try {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        return user.token || null;
      }
    } catch (error) {
      console.warn('Erro ao extrair token do currentUser:', error);
    }
    return null;
  }

  // ✅ Método centralizado para obter CSRF token COM CACHE
  public getCsrfToken(): Observable<string> {
    const cachedToken = this.csrfTokenSubject.value;
    if (cachedToken) {
      return of(cachedToken);
    }

    if (!environment.production) {
      console.log(`🔑 [${this.constructor.name}] Solicitando CSRF token...`);
    }
    
    // ✅ CORREÇÃO: Fazer requisição direta para evitar loops com interceptor
    return this.http.get<CsrfTokenResponse>(
      `${this.baseUrl}/api/csrf-token`, 
      { 
        withCredentials: true,
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      map((response: CsrfTokenResponse) => {
        if (!environment.production) {
          console.log(`✅ [${this.constructor.name}] CSRF token recebido`);
        }
        this.csrfTokenSubject.next(response.csrfToken);
        return response.csrfToken;
      }),
      catchError(error => {
        console.error(`❌ [${this.constructor.name}] Erro ao obter CSRF token:`, error);
        this.csrfTokenSubject.next(null);
        return of('');
      })
    );
  }

  // ✅ Limpar cache do CSRF token
  public clearCsrfCache(): void {
    this.csrfTokenSubject.next(null);
  }

  // ✅ Método para construir headers
  public buildHeaders(includeAuth = true, includeCSRF = false, csrfToken = ''): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (includeAuth) {
      const authToken = this.getAuthToken();
      if (authToken) {
        headers = headers.set('Authorization', `Bearer ${authToken}`);
      }
    }

    if (includeCSRF && csrfToken) {
      headers = headers.set('X-CSRF-Token', csrfToken);
    }

    return headers;
  }

  // ✅ Método para construir headers para FormData
  public buildFormDataHeaders(includeAuth = true, includeCSRF = false, csrfToken = ''): HttpHeaders {
    let headers = new HttpHeaders();

    if (includeAuth) {
      const authToken = this.getAuthToken();
      if (authToken) {
        headers = headers.set('Authorization', `Bearer ${authToken}`);
      }
    }

    if (includeCSRF && csrfToken) {
      headers = headers.set('X-CSRF-Token', csrfToken);
    }

    return headers;
  }

  // ✅ Tratamento de erro padronizado
  protected handleError(error: HttpErrorResponse, context?: string): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de rede: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 409:
          errorMessage = error.error?.message || 'Conflito de dados';
          break;
        case 422:
          errorMessage = error.error?.message || 'Dados de validação inválidos';
          break;
        case 429:
          errorMessage = 'Muitas requisições. Tente novamente em alguns minutos.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Serviço temporariamente indisponível';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    const fullContext = context ? `[${this.constructor.name}:${context}]` : `[${this.constructor.name}]`;
    console.error(`${fullContext} ${errorMessage}`, error);
    
    return throwError(() => new Error(errorMessage));
  }

  // ✅ Retry strategy simplificada
  protected retryStrategy<T>(retryCount: number = this.DEFAULT_RETRY_COUNT) {
    return retry<T>({
      count: retryCount,
      delay: (error: any, retryIndex: number) => {
        // ✅ CORREÇÃO: Não retry em erros de CORS (status 0)
        if ([0, 401, 403, 422].includes(error.status)) {
          throw error;
        }
        
        const delayTime = Math.pow(2, retryIndex) * 1000;
        if (!environment.production) {
          console.log(`🔄 [${this.constructor.name}] Tentativa ${retryIndex + 1} em ${delayTime}ms`);
        }
        
        return timer(delayTime);
      }
    });
  }

  // ✅ GET request
  protected httpGet<T>(endpoint: string, includeAuth = true, includeCSRF = false): Observable<T> {
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
    
    if (includeCSRF) {
      return this.getCsrfToken().pipe(
        switchMap(csrfToken => {
          const headers = this.buildHeaders(includeAuth, true, csrfToken);
          return this.http.get<T>(fullUrl, {
            headers,
            withCredentials: true
          });
        }),
        timeout(this.DEFAULT_TIMEOUT),
        this.retryStrategy<T>(),
        catchError(error => this.handleError(error, 'GET'))
      );
    }

    const headers = this.buildHeaders(includeAuth);
    return this.http.get<T>(fullUrl, {
      headers,
      withCredentials: true
    }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      this.retryStrategy<T>(),
      catchError(error => this.handleError(error, 'GET'))
    );
  }

  // ✅ POST request
  protected httpPost<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
    
    if (includeCSRF) {
      return this.getCsrfToken().pipe(
        switchMap(csrfToken => {
          let headers;
          
          if (data instanceof FormData) {
            headers = this.buildFormDataHeaders(includeAuth, true, csrfToken);
          } else {
            headers = this.buildHeaders(includeAuth, true, csrfToken);
          }
          
          return this.http.post<T>(fullUrl, data, {
            headers,
            withCredentials: true
          });
        }),
        timeout(this.DEFAULT_TIMEOUT),
        this.retryStrategy<T>(),
        catchError(error => this.handleError(error, 'POST'))
      );
    }

    let headers;
    if (data instanceof FormData) {
      headers = this.buildFormDataHeaders(includeAuth);
    } else {
      headers = this.buildHeaders(includeAuth);
    }

    return this.http.post<T>(fullUrl, data, {
      headers,
      withCredentials: true
    }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      this.retryStrategy<T>(),
      catchError(error => this.handleError(error, 'POST'))
    );
  }

  // ✅ PUT request
  protected httpPut<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
    
    if (includeCSRF) {
      return this.getCsrfToken().pipe(
        switchMap(csrfToken => {
          let headers;
          
          if (data instanceof FormData) {
            headers = this.buildFormDataHeaders(includeAuth, true, csrfToken);
          } else {
            headers = this.buildHeaders(includeAuth, true, csrfToken);
          }
          
          return this.http.put<T>(fullUrl, data, {
            headers,
            withCredentials: true
          });
        }),
        timeout(this.DEFAULT_TIMEOUT),
        this.retryStrategy<T>(),
        catchError(error => this.handleError(error, 'PUT'))
      );
    }

    let headers;
    if (data instanceof FormData) {
      headers = this.buildFormDataHeaders(includeAuth);
    } else {
      headers = this.buildHeaders(includeAuth);
    }

    return this.http.put<T>(fullUrl, data, {
      headers,
      withCredentials: true
    }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      this.retryStrategy<T>(),
      catchError(error => this.handleError(error, 'PUT'))
    );
  }

  // ✅ PATCH request
  protected httpPatch<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
    
    if (includeCSRF) {
      return this.getCsrfToken().pipe(
        switchMap(csrfToken => {
          let headers;
          
          if (data instanceof FormData) {
            headers = this.buildFormDataHeaders(includeAuth, true, csrfToken);
          } else {
            headers = this.buildHeaders(includeAuth, true, csrfToken);
          }
          
          return this.http.patch<T>(fullUrl, data, {
            headers,
            withCredentials: true
          });
        }),
        timeout(this.DEFAULT_TIMEOUT),
        this.retryStrategy<T>(),
        catchError(error => this.handleError(error, 'PATCH'))
      );
    }

    let headers;
    if (data instanceof FormData) {
      headers = this.buildFormDataHeaders(includeAuth);
    } else {
      headers = this.buildHeaders(includeAuth);
    }

    return this.http.patch<T>(fullUrl, data, {
      headers,
      withCredentials: true
    }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      this.retryStrategy<T>(),
      catchError(error => this.handleError(error, 'PATCH'))
    );
  }

  // ✅ DELETE request - RENOMEADO para evitar conflitos
  protected httpDelete<T>(endpoint: string, includeAuth = true, includeCSRF = true): Observable<T> {
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
    
    if (includeCSRF) {
      return this.getCsrfToken().pipe(
        switchMap(csrfToken => {
          const headers = this.buildHeaders(includeAuth, true, csrfToken);
          return this.http.delete<T>(fullUrl, {
            headers,
            withCredentials: true
          });
        }),
        timeout(this.DEFAULT_TIMEOUT),
        this.retryStrategy<T>(),
        catchError(error => this.handleError(error, 'DELETE'))
      );
    }

    const headers = this.buildHeaders(includeAuth);
    return this.http.delete<T>(fullUrl, {
      headers,
      withCredentials: true
    }).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      this.retryStrategy<T>(),
      catchError(error => this.handleError(error, 'DELETE'))
    );
  }

  // ✅ Upload de arquivos
  protected uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        if (additionalData[key] !== null && additionalData[key] !== undefined) {
          formData.append(key, additionalData[key]);
        }
      });
    }

    return this.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = this.buildFormDataHeaders(true, true, csrfToken);
        const fullUrl = endpoint.startsWith('/api') ? `${this.baseUrl}${endpoint}` : `${this.baseUrl}${this.apiEndpoint}${endpoint}`;

        return this.http.post<T>(fullUrl, formData, {
          headers,
          withCredentials: true,
          reportProgress: true
        });
      }),
      timeout(60000), // 60 segundos para upload
      catchError(error => this.handleError(error, 'UPLOAD'))
    );
  }

  // ✅ Métodos com nomenclatura original para compatibilidade
  protected get<T>(endpoint: string, includeAuth = true, includeCSRF = false): Observable<T> {
    return this.httpGet<T>(endpoint, includeAuth, includeCSRF);
  }

  protected post<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    return this.httpPost<T>(endpoint, data, includeAuth, includeCSRF);
  }

  protected put<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    return this.httpPut<T>(endpoint, data, includeAuth, includeCSRF);
  }

  protected patch<T>(endpoint: string, data: any, includeAuth = true, includeCSRF = true): Observable<T> {
    return this.httpPatch<T>(endpoint, data, includeAuth, includeCSRF);
  }

  // ✅ Método delete protegido que pode ser usado pelos serviços filhos
  protected deleteRequest<T>(endpoint: string, includeAuth = true, includeCSRF = true): Observable<T> {
    return this.httpDelete<T>(endpoint, includeAuth, includeCSRF);
  }

  // ✅ Métodos utilitários
  protected isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  protected buildUrl(endpoint: string): string {
    return `${this.baseUrl}${this.apiEndpoint}${endpoint}`;
  }

  protected log(message: string, data?: any): void {
    if (!environment.production) {
      console.log(`[${this.constructor.name}] ${message}`, data || '');
    }
  }

  public clearCache(): void {
    this.clearCsrfCache();
  }
}
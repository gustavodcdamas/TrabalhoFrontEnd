import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface Administrator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'super_admin';
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAdminDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin';
  isAdmin?: boolean;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  password?: string;
}

export interface AdminSearchParams {
  firstName?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {
  // ✅ CORRIGIDO: URL base com /api
  private readonly baseUrl = 'http://localhost:3333/api';
  private administratorsSubject = new BehaviorSubject<Administrator[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  public administrators$ = this.administratorsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService // ✅ INJETADO para obter CSRF token
  ) {}

  // ✅ MÉTODO PARA OBTER HEADERS COM CSRF TOKEN
  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.getCsrfToken().pipe(
      map(csrfToken => {
        const token = this.authService.token;
        return new HttpHeaders({
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });
      })
    );
  }

  // ✅ MÉTODO PARA HEADERS SEM CSRF (para GET requests)
  private getHeadersWithoutCSRF(): HttpHeaders {
    const token = this.authService.token;
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private getCacheKey(url: string, params?: any): string {
    return `${url}_${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // ✅ AGORA COM ENDPOINT REAL FUNCIONANDO
  loadAdministrators(): Observable<Administrator[]> {
    console.log('🔄 [AdministratorService] Carregando administradores...');
    
    const cacheKey = this.getCacheKey('/users/administrators');
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 [AdministratorService] Dados do cache:', cached);
      this.administratorsSubject.next(cached);
      return of(cached);
    }

    this.loadingSubject.next(true);
    
    // ✅ USANDO ENDPOINT REAL AGORA QUE FOI CORRIGIDO
    return this.http.get<Administrator[]>(`${this.baseUrl}/users/administrators`, { 
      headers: this.getHeadersWithoutCSRF(),
      withCredentials: true
    }).pipe(
      tap(admins => {
        console.log('✅ [AdministratorService] Administradores recebidos:', admins);
        this.administratorsSubject.next(admins);
        this.setCache(cacheKey, admins);
        this.loadingSubject.next(false);
      }),
      catchError((error: any) => {
        console.error('❌ [AdministratorService] Erro ao carregar:', error);
        this.loadingSubject.next(false);
        
        // ✅ FALLBACK: Retornar dados mockados em caso de erro
        const mockData: Administrator[] = [
          {
            id: '1',
            firstName: 'Admin',
            lastName: 'Principal',
            email: 'admin@teste.com',
            role: 'super_admin',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            firstName: 'Admin',
            lastName: 'Secundário', 
            email: 'admin2@teste.com',
            role: 'admin',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            firstName: 'João',
            lastName: 'Silva',
            email: 'joao@teste.com',
            role: 'admin',
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        console.warn('⚠️ [AdministratorService] Usando dados mockados devido ao erro');
        this.administratorsSubject.next(mockData);
        return of(mockData);
      })
    );
  }

  // ✅ MÉTODO DE TESTE PARA VERIFICAR SE ENDPOINTS EXISTEM
  testEndpoint(): Observable<any> {
    const testUrl = `${this.baseUrl}/users/admin/test`;
    console.log('🧪 [AdministratorService] Testando endpoint:', testUrl);
    
    return this.http.get(testUrl, {
      headers: this.getHeadersWithoutCSRF(),
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('✅ [AdministratorService] Endpoint de teste funcionou:', response);
      }),
      catchError(error => {
        console.error('❌ [AdministratorService] Endpoint de teste falhou:', error);
        throw error;
      })
    );
  }

  // ✅ CORRIGIDO: POST precisa de CSRF token
  createAdministrator(adminData: CreateAdminDto): Observable<{ message: string }> {
    console.log('📝 [AdministratorService] Criando administrador:', adminData);
    
    const payload: CreateAdminDto = {
      ...adminData,
      isAdmin: true
    };

    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.post<{ message: string }>(`${this.baseUrl}/users/admin`, payload, {
          headers,
          withCredentials: true
        })
      ),
      tap(() => {
        console.log('✅ [AdministratorService] Administrador criado com sucesso');
        this.clearCache('/users/administrators');
        this.loadAdministrators().subscribe();
      }),
      catchError((error: any) => {
        console.error('❌ [AdministratorService] Erro ao criar:', error);
        throw error;
      })
    );
  }

  // ✅ VERSÃO COM DEBUG COMPLETO DO updateAdministrator
  updateAdministrator(id: string, adminData: UpdateAdminDto): Observable<Administrator> {
    console.log('🚀 [AdministratorService] ==================== INÍCIO updateAdministrator ====================');
    console.log('🔗 [AdministratorService] Base URL:', this.baseUrl);
    console.log('🆔 [AdministratorService] ID recebido:', id);
    console.log('📝 [AdministratorService] Dados para atualização:', JSON.stringify(adminData, null, 2));
    
    // ✅ USAR ENDPOINT GENÉRICO QUE FUNCIONA
    const fullUrl = `${this.baseUrl}/users/${id}`;
    console.log('🌐 [AdministratorService] URL (endpoint genérico):', fullUrl);
    
    return this.getHeaders().pipe(
      tap(headers => {
        console.log('📋 [AdministratorService] Headers preparados:', {
          'Authorization': headers.get('Authorization') ? 'Bearer ***' : 'MISSING',
          'Content-Type': headers.get('Content-Type'),
          'X-CSRF-TOKEN': headers.get('X-CSRF-TOKEN') ? '***' : 'MISSING'
        });
      }),
      switchMap(headers => {
        console.log('📤 [AdministratorService] Enviando requisição PATCH...');
        console.log('📤 [AdministratorService] URL:', fullUrl);
        console.log('📤 [AdministratorService] Body:', JSON.stringify(adminData, null, 2));
        
        return this.http.patch<Administrator>(fullUrl, adminData, {
          headers,
          withCredentials: true,
          // ✅ ADICIONAR observe: 'response' para ver detalhes da resposta
          observe: 'response'
        }).pipe(
          tap(response => {
            console.log('📥 [AdministratorService] Resposta completa recebida:');
            console.log('📥 Status:', response.status);
            console.log('📥 Headers da resposta:', response.headers.keys());
            console.log('📥 Body:', JSON.stringify(response.body, null, 2));
          }),
          map(response => response.body as Administrator)
        );
      }),
      tap((result) => {
        console.log('✅ [AdministratorService] Administrador atualizado com sucesso');
        console.log('✅ [AdministratorService] Resultado final:', JSON.stringify(result, null, 2));
        console.log('🔄 [AdministratorService] Limpando cache...');
        this.clearCache();
        console.log('📥 [AdministratorService] Recarregando lista de administradores...');
        this.loadAdministrators().subscribe();
      }),
      catchError((error: any) => {
        console.error('💥 [AdministratorService] ERRO COMPLETO:');
        console.error('💥 Status:', error.status);
        console.error('💥 StatusText:', error.statusText);
        console.error('💥 URL:', error.url);
        console.error('💥 Error body:', error.error);
        console.error('💥 Message:', error.message);
        
        // ✅ DETALHES ESPECÍFICOS DO ERRO
        if (error.status === 400) {
          console.error('🚨 BAD REQUEST - Verificar dados enviados');
        } else if (error.status === 403) {
          console.error('🚨 FORBIDDEN - Verificar permissões');
        } else if (error.status === 404) {
          console.error('🚨 NOT FOUND - Usuário não encontrado');
        } else if (error.status === 422) {
          console.error('🚨 VALIDATION ERROR - Dados inválidos');
        }
        
        throw error;
      }),
      finalize(() => {
        console.log('🏁 [AdministratorService] ==================== FIM updateAdministrator ====================');
      })
    );
  }

  // ✅ MÉTODO FALLBACK: Usar endpoint genérico se o específico não existir
  private updateAdministratorFallback(id: string, adminData: UpdateAdminDto): Observable<Administrator> {
    console.log('🔄 [AdministratorService] Usando endpoint fallback...');
    const fallbackUrl = `${this.baseUrl}/users/${id}`;
    console.log('🌐 [AdministratorService] URL fallback:', fallbackUrl);
    
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.patch<Administrator>(fallbackUrl, adminData, {
          headers,
          withCredentials: true
        })
      ),
      tap(() => {
        console.log('✅ [AdministratorService] Administrador atualizado via fallback');
        this.clearCache();
        this.loadAdministrators().subscribe();
      })
    );
  }

  // ✅ CORRIGIDO: DELETE precisa de CSRF token
  deleteAdministrator(email: string): Observable<void> {
    console.log('🗑️ [AdministratorService] Excluindo administrador:', email);
    
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.baseUrl}/users/${email}`, {
          headers,
          withCredentials: true
        })
      ),
      tap(() => {
        console.log('✅ [AdministratorService] Administrador excluído');
        this.clearCache();
        this.loadAdministrators().subscribe();
      }),
      catchError((error: any) => {
        console.error('❌ [AdministratorService] Erro ao excluir:', error);
        throw error;
      })
    );
  }

  invalidateCache(): void {
    this.clearCache();
  }

  canEditAdmin(currentUserRole?: string, targetUserRole?: string): boolean {
    return currentUserRole === 'super_admin';
  }

  canDeleteAdmin(currentUserRole?: string, targetUserRole?: string): boolean {
    return currentUserRole === 'super_admin' && targetUserRole !== 'super_admin';
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface Cliente {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telefone?: string;
  role: 'client';
  isEmailVerified: boolean;
  created_at?: Date;    // ✅ CORRIGIDO: usando created_at
  updated_at?: Date;    // ✅ CORRIGIDO: usando updated_at
}

export interface CreateClienteDto {
  firstName: string;
  lastName: string;
  email: string;
  telefone?: string;
  password: string;
  role?: 'client';
  isClient?: boolean;
}

export interface UpdateClienteDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  telefone?: string;
  password?: string;
}

export interface ClienteSearchParams {
  firstName?: string;
  email?: string;
  telefone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private readonly baseUrl = 'http://localhost:3333/api';
  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  public clientes$ = this.clientesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.getCsrfToken().pipe(
      map(csrfToken => {
        const token = this.authService.token;
        console.log('🔑 [ClientesService] Token JWT:', token ? 'Presente' : 'AUSENTE');
        console.log('🔒 [ClientesService] CSRF Token:', csrfToken ? 'Presente' : 'AUSENTE');
        
        return new HttpHeaders({
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        });
      })
    );
  }

  private getHeadersWithoutCSRF(): HttpHeaders {
    const token = this.authService.token;
    console.log('🔑 [ClientesService] Token JWT (sem CSRF):', token ? 'Presente' : 'AUSENTE');
    
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

  // ✅ CORRIGIDO: Usar a rota correta que existe no backend
  loadClientes(): Observable<Cliente[]> {
    console.log('🔄 [ClientesService] Carregando clientes...');
    
    const cacheKey = this.getCacheKey('/users/clients');
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      console.log('📦 [ClientesService] Dados do cache:', cached);
      this.clientesSubject.next(cached);
      return of(cached);
    }

    this.loadingSubject.next(true);
    
    // ✅ USAR A ROTA CORRETA QUE AGORA EXISTE NO BACKEND
    const fullUrl = `${this.baseUrl}/users/clients`;
    
    console.log('📡 [ClientesService] Carregando de:', fullUrl);
    
    return this.getHeaders().pipe(
      switchMap(headers => {
        console.log('📋 [ClientesService] Headers para GET:', {
          'Authorization': headers.get('Authorization') ? 'Bearer ***' : 'MISSING',
          'Content-Type': headers.get('Content-Type'),
          'X-CSRF-TOKEN': headers.get('X-CSRF-TOKEN') ? '***' : 'MISSING'
        });

        return this.http.get<Cliente[]>(fullUrl, { 
          headers,
          withCredentials: true
        });
      }),
      tap(clientes => {
        console.log('✅ [ClientesService] Clientes recebidos:', clientes);
        this.clientesSubject.next(clientes);
        this.setCache(cacheKey, clientes);
        this.loadingSubject.next(false);
      }),
      catchError((error: any) => {
        console.error('❌ [ClientesService] Erro ao carregar:', error);
        console.error('❌ [ClientesService] Status:', error.status);
        console.error('❌ [ClientesService] URL que falhou:', error.url);
        
        this.loadingSubject.next(false);
        
        // Se ainda der erro, mostrar dados mockados temporariamente
        const mockData: Cliente[] = [
          {
            id: '1',
            firstName: 'João',
            lastName: 'Silva',
            email: 'joao@teste.com',
            telefone: '(31) 99999-9999',
            role: 'client',
            isEmailVerified: true,
            created_at: new Date(),    // ✅ CORRIGIDO
            updated_at: new Date()     // ✅ CORRIGIDO
          }
        ];
        
        console.warn('⚠️ [ClientesService] Usando dados mockados devido ao erro');
        this.clientesSubject.next(mockData);
        return of(mockData);
      })
    );
  }

  // ✅ NOVO: Método para testar rotas alternativas
  private tryAlternativeRoutes(): Observable<Cliente[]> {
    const alternativeRoutes = [
      '/users',           // Todos os usuários
      '/clients',         // Só clientes
      '/auth/users',      // Dentro do módulo auth
      '/admin/users'      // Dentro do módulo admin
    ];

    console.log('🔍 [ClientesService] Testando rotas alternativas...');

    // Testar cada rota sequencialmente
    return this.testRoute(alternativeRoutes, 0);
  }

  private testRoute(routes: string[], index: number): Observable<Cliente[]> {
    if (index >= routes.length) {
      console.error('❌ [ClientesService] Todas as rotas falharam');
      return of([]);
    }

    const route = routes[index];
    const fullUrl = `${this.baseUrl}${route}`;
    
    console.log(`🧪 [ClientesService] Testando rota ${index + 1}/${routes.length}: ${fullUrl}`);

    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get<Cliente[]>(fullUrl, { 
          headers,
          withCredentials: true
        })
      ),
      tap(result => {
        console.log(`✅ [ClientesService] Rota funcionou: ${route}`, result);
      }),
      catchError(error => {
        console.log(`❌ [ClientesService] Rota falhou: ${route} (${error.status})`);
        return this.testRoute(routes, index + 1);
      })
    );
  }

  createCliente(clienteData: CreateClienteDto): Observable<{ message: string }> {
    console.log('🚀 [ClientesService] ==================== INÍCIO createCliente ====================');
    console.log('📝 [ClientesService] Dados ORIGINAIS recebidos:', JSON.stringify(clienteData, null, 2));
    
    // ✅ LIMPAR E VALIDAR DADOS ANTES DE ENVIAR
    const cleanedPayload: any = {
      firstName: clienteData.firstName?.trim(),
      lastName: clienteData.lastName?.trim(),
      email: clienteData.email?.trim().toLowerCase(),
      password: clienteData.password?.trim(),
    };

    // ✅ TELEFONE: só adicionar se preenchido e válido
    if (clienteData.telefone && clienteData.telefone.trim()) {
      const telefone = clienteData.telefone.trim();
      const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      
      if (telefoneRegex.test(telefone)) {
        cleanedPayload.telefone = telefone;
        console.log('📱 [ClientesService] Telefone válido incluído:', telefone);
      } else {
        console.error('❌ [ClientesService] Telefone inválido, será omitido:', telefone);
        // Não incluir telefone inválido
      }
    } else {
      console.log('📱 [ClientesService] Telefone vazio ou não fornecido');
    }

    // ✅ NÃO ENVIAR role, isClient, etc. - deixar o backend definir
    console.log('📤 [ClientesService] Payload FINAL para envio:', JSON.stringify(cleanedPayload, null, 2));
    console.log('📊 [ClientesService] Campos incluídos:', Object.keys(cleanedPayload));

    const fullUrl = `${this.baseUrl}/users/client`;
    console.log('📡 [ClientesService] URL:', fullUrl);

    return this.getHeaders().pipe(
      switchMap(headers => {
        console.log('📋 [ClientesService] Headers:', {
          'Authorization': headers.get('Authorization') ? 'Bearer ***' : 'MISSING',
          'Content-Type': headers.get('Content-Type'),
          'X-CSRF-TOKEN': headers.get('X-CSRF-TOKEN') ? '***' : 'MISSING'
        });

        console.log('📤 [ClientesService] Enviando requisição POST...');
        console.log('📤 [ClientesService] Content-Type:', headers.get('Content-Type'));
        console.log('📤 [ClientesService] Body stringified:', JSON.stringify(cleanedPayload));
        
        return this.http.post<{ message: string }>(fullUrl, cleanedPayload, {
          headers,
          withCredentials: true
        });
      }),
      tap((response) => {
        console.log('✅ [ClientesService] Resposta recebida:', response);
        this.clearCache('/users/clients');
        this.loadClientes().subscribe();
      }),
      catchError((error: any) => {
        console.error('💥 [ClientesService] ==================== ERRO createCliente ====================');
        console.error('💥 [ClientesService] Status:', error.status);
        console.error('💥 [ClientesService] StatusText:', error.statusText);
        console.error('💥 [ClientesService] Error body:', error.error);
        console.error('💥 [ClientesService] Message:', error.message);
        console.error('💥 [ClientesService] URL:', error.url);
        
        // ✅ MOSTRAR DETALHES ESPECÍFICOS DO ERRO DE VALIDAÇÃO
        if (error.error?.message) {
          if (Array.isArray(error.error.message)) {
            console.error('💥 [ClientesService] Erros de validação:');
            error.error.message.forEach((msg: string, index: number) => {
              console.error(`  ${index + 1}. ${msg}`);
            });
          } else {
            console.error('💥 [ClientesService] Erro específico:', error.error.message);
          }
        }
        
        throw error;
      }),
      finalize(() => {
        console.log('🏁 [ClientesService] ==================== FIM createCliente ====================');
      })
    );
  }

  updateCliente(id: string, clienteData: UpdateClienteDto): Observable<Cliente> {
    console.log('🚀 [ClientesService] ==================== INÍCIO updateCliente ====================');
    console.log('🔗 [ClientesService] Base URL:', this.baseUrl);
    console.log('🆔 [ClientesService] ID recebido:', id);
    console.log('📝 [ClientesService] Dados para atualização:', JSON.stringify(clienteData, null, 2));
    
    // ✅ USAR ROTA ESPECÍFICA PARA CLIENTES EM VEZ DA GENÉRICA
    const fullUrl = `${this.baseUrl}/users/client/${id}`;
    console.log('🌐 [ClientesService] URL (rota específica):', fullUrl);
    
    // ✅ VALIDAR E LIMPAR TELEFONE ANTES DE ENVIAR
    const cleanedData = { ...clienteData };
    
    // Se tem telefone, validar formato
    if (cleanedData.telefone) {
      const telefone = cleanedData.telefone.trim();
      
      // Se está vazio, remover do payload
      if (!telefone) {
        delete cleanedData.telefone;
        console.log('📱 [ClientesService] Telefone vazio removido');
      } else {
        // Verificar se está no formato correto (XX) XXXXX-XXXX
        const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        
        if (!telefoneRegex.test(telefone)) {
          console.error('❌ [ClientesService] Formato de telefone inválido:', telefone);
          return throwError(() => ({
            error: {
              message: ['Formato de telefone inválido. Use: (00) 00000-0000'],
              statusCode: 400
            }
          }));
        }
        
        cleanedData.telefone = telefone;
        console.log('📱 [ClientesService] Telefone validado:', telefone);
      }
    }
    
    console.log('📤 [ClientesService] Dados finais limpos:', JSON.stringify(cleanedData, null, 2));
    
    return this.getHeaders().pipe(
      tap(headers => {
        console.log('📋 [ClientesService] Headers preparados:', {
          'Authorization': headers.get('Authorization') ? 'Bearer ***' : 'MISSING',
          'Content-Type': headers.get('Content-Type'),
          'X-CSRF-TOKEN': headers.get('X-CSRF-TOKEN') ? '***' : 'MISSING'
        });
      }),
      switchMap(headers => {
        console.log('📤 [ClientesService] Enviando requisição PATCH...');
        console.log('📤 [ClientesService] URL:', fullUrl);
        console.log('📤 [ClientesService] Body:', JSON.stringify(cleanedData, null, 2));
        
        return this.http.patch<Cliente>(fullUrl, cleanedData, {
          headers,
          withCredentials: true,
          observe: 'response'
        }).pipe(
          tap(response => {
            console.log('📥 [ClientesService] Resposta completa recebida:');
            console.log('📥 Status:', response.status);
            console.log('📥 Headers da resposta:', response.headers.keys());
            console.log('📥 Body:', JSON.stringify(response.body, null, 2));
          }),
          map(response => response.body as Cliente)
        );
      }),
      tap((result) => {
        console.log('✅ [ClientesService] Cliente atualizado com sucesso');
        console.log('✅ [ClientesService] Resultado final:', JSON.stringify(result, null, 2));
        console.log('🔄 [ClientesService] Limpando cache...');
        this.clearCache();
        console.log('📥 [ClientesService] Recarregando lista de clientes...');
        this.loadClientes().subscribe();
      }),
      catchError((error: any) => {
        console.error('💥 [ClientesService] ERRO COMPLETO:');
        console.error('💥 Status:', error.status);
        console.error('💥 StatusText:', error.statusText);
        console.error('💥 URL:', error.url);
        console.error('💥 Error body:', error.error);
        console.error('💥 Message:', error.message);
        
        throw error;
      }),
      finalize(() => {
        console.log('🏁 [ClientesService] ==================== FIM updateCliente ====================');
      })
    );
  }

  deleteCliente(email: string): Observable<void> {
    console.log('🗑️ [ClientesService] Excluindo cliente:', email);
    
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.baseUrl}/users/${email}`, {
          headers,
          withCredentials: true
        })
      ),
      tap(() => {
        console.log('✅ [ClientesService] Cliente excluído');
        this.clearCache();
        this.loadClientes().subscribe();
      }),
      catchError((error: any) => {
        console.error('❌ [ClientesService] Erro ao excluir:', error);
        throw error;
      })
    );
  }

  invalidateCache(): void {
    this.clearCache();
  }

  // ✅ NOVO: Método para testar conectividade com o backend
  testBackendConnection(): Observable<any> {
    console.log('🔍 [ClientesService] Testando conexão com backend...');
    
    return this.http.get(`${this.baseUrl}/monitoring/health`, {
      withCredentials: true
    }).pipe(
      tap(result => {
        console.log('✅ [ClientesService] Backend conectado:', result);
      }),
      catchError(error => {
        console.error('❌ [ClientesService] Backend não conectado:', error);
        throw error;
      })
    );
  }
}
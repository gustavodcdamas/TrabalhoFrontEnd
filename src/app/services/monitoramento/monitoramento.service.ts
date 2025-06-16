import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service'; // Ajuste o caminho conforme necessário

export interface PingStatus {
  backend: {
    status: 'pong' | 'not_pong';
    responseTime: number;
    timestamp: string;
  };
  redis: {
    status: 'pong' | 'not_pong';
    responseTime: number;
    timestamp: string;
    error?: string;
  };
  database: {
    status: 'pong' | 'not_pong';
    responseTime: number;
    timestamp: string;
    error?: string;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: PingStatus;
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}

export interface LogFilters {
  limit?: number;
  level?: string;
  service?: string;
  date?: string;
}

export interface LogResponse {
  logs: Array<{
    id: number;
    content: string;
    timestamp: string;
  }>;
  total: number;
  filtered?: number;
  message?: string;
  error?: string;
}

export interface SystemInfo {
  node: {
    version: string;
    platform: string;
    arch: string;
    uptime: number;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
    usagePercent: number;
  };
  environment: {
    nodeEnv: string;
    port: string;
    timezone: string;
  };
  docker: {
    isDocker: boolean;
    hostname: string;
  };
}

export interface Metrics {
  users: {
    total: number;
    admins: number;
  };
  requests: {
    total: number;
    errors: number;
    avgResponseTime: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: {
      user: number;
      system: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private apiUrl = `${environment.apiUrl}/api/monitoring`;
  
  // Subjects para dados em tempo real
  private pingStatusSubject = new BehaviorSubject<PingStatus | null>(null);
  private healthCheckSubject = new BehaviorSubject<HealthCheck | null>(null);
  
  public pingStatus$ = this.pingStatusSubject.asObservable();
  public healthCheck$ = this.healthCheckSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService // ⭐ Injetar o AuthService
  ) {
    // Auto-refresh a cada 30 segundos - apenas se logado
    this.startAutoRefresh();
  }

  // ✅ MÉTODO PARA OBTER HEADERS COM TOKEN - USANDO SEU AUTHSERVICE
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // ⭐ Usar o método token do seu AuthService
    const token = this.authService.token;
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔑 Token encontrado para monitoring:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Token não encontrado! Usuário pode não estar autenticado.');
      console.log('🔍 Debug - isLoggedIn:', this.authService.isLoggedIn());
      console.log('🔍 Debug - currentUser:', this.authService.currentUserValue);
    }
    
    return headers;
  }

  // ✅ VERIFICAR SE USUÁRIO ESTÁ AUTENTICADO
  private isAuthenticated(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    if (!isLoggedIn) {
      console.warn('⚠️ Usuário não está autenticado para acessar monitoramento');
    }
    return isLoggedIn;
  }

  // ✅ PING STATUS
  getPingStatus(): Observable<PingStatus> {
    // Verificar autenticação antes de fazer requisição
    if (!this.isAuthenticated()) {
      const errorStatus: PingStatus = {
        backend: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString() },
        redis: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Not authenticated' },
        database: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Not authenticated' }
      };
      this.pingStatusSubject.next(errorStatus);
      return of(errorStatus);
    }

    return this.http.get<PingStatus>(`${this.apiUrl}/ping`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      map(response => {
        this.pingStatusSubject.next(response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao obter ping status:', error);
        
        // Se for erro 401 (token expirado), fazer logout
        if (error.status === 401) {
          console.error('🔒 Token inválido ou expirado! Fazendo logout...');
          this.authService.logout();
        }
        
        const errorStatus: PingStatus = {
          backend: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString() },
          redis: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Request failed' },
          database: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Request failed' }
        };
        this.pingStatusSubject.next(errorStatus);
        throw error;
      })
    );
  }

  // ✅ HEALTH CHECK
  getHealthCheck(): Observable<HealthCheck> {
    if (!this.isAuthenticated()) {
      const errorHealthCheck: HealthCheck = {
        status: 'unhealthy',
        checks: {
          backend: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString() },
          redis: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Not authenticated' },
          database: { status: 'not_pong', responseTime: 0, timestamp: new Date().toISOString(), error: 'Not authenticated' }
        },
        uptime: 0,
        timestamp: new Date().toISOString(),
        version: 'N/A',
        environment: 'N/A'
      };
      this.healthCheckSubject.next(errorHealthCheck);
      return of(errorHealthCheck);
    }

    return this.http.get<HealthCheck>(`${this.apiUrl}/health`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      map(response => {
        this.healthCheckSubject.next(response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao obter health check:', error);
        
        if (error.status === 401) {
          this.authService.logout();
        }
        
        throw error;
      })
    );
  }

  // ✅ LOGS
  getLogs(filters?: LogFilters): Observable<LogResponse> {
    if (!this.isAuthenticated()) {
      return of({
        logs: [],
        total: 0,
        error: 'Not authenticated'
      });
    }

    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<LogResponse>(`${this.apiUrl}/logs`, {
      params,
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        throw error;
      })
    );
  }

  // ✅ SYSTEM INFO
  getSystemInfo(): Observable<SystemInfo> {
    if (!this.isAuthenticated()) {
      return of({
        node: { version: 'N/A', platform: 'N/A', arch: 'N/A', uptime: 0 },
        memory: { rss: 'N/A', heapTotal: 'N/A', heapUsed: 'N/A', external: 'N/A', usagePercent: 0 },
        environment: { nodeEnv: 'N/A', port: 'N/A', timezone: 'N/A' },
        docker: { isDocker: false, hostname: 'N/A' }
      });
    }

    return this.http.get<SystemInfo>(`${this.apiUrl}/system-info`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        throw error;
      })
    );
  }

  // ✅ METRICS
  getMetrics(): Observable<Metrics> {
    if (!this.isAuthenticated()) {
      return of({
        users: { total: 0, admins: 0 },
        requests: { total: 0, errors: 0, avgResponseTime: 0 },
        system: { uptime: 0, memoryUsage: 0, cpuUsage: { user: 0, system: 0 } }
      });
    }

    return this.http.get<Metrics>(`${this.apiUrl}/metrics`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        throw error;
      })
    );
  }

  // ✅ AUTO REFRESH - Apenas se autenticado
  private startAutoRefresh(): void {
    // Ping status a cada 30 segundos
    interval(30000).pipe(
      startWith(0),
      switchMap(() => {
        // ⭐ Só fazer refresh se estiver logado
        if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
          return this.getPingStatus().pipe(
            catchError(() => of(null))
          );
        } else {
          console.log('🔄 Auto-refresh pausado: usuário não autenticado');
          return of(null);
        }
      })
    ).subscribe();

    // Health check a cada 60 segundos
    interval(60000).pipe(
      startWith(0),
      switchMap(() => {
        if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
          return this.getHealthCheck().pipe(
            catchError(() => of(null))
          );
        } else {
          return of(null);
        }
      })
    ).subscribe();
  }

  // ✅ FORCE REFRESH
  forceRefresh(): void {
    if (!this.authService.isLoggedIn()) {
      console.warn('⚠️ Não é possível atualizar: usuário não autenticado');
      return;
    }

    if (this.authService.isTokenExpired()) {
      console.warn('⚠️ Token expirado! Fazendo logout...');
      this.authService.logout();
      return;
    }

    this.getPingStatus().subscribe({
      error: (err) => console.error('❌ Erro no force refresh ping:', err)
    });
    
    this.getHealthCheck().subscribe({
      error: (err) => console.error('❌ Erro no force refresh health:', err)
    });
  }

  // ✅ DEBUG: Método para verificar status da autenticação
  debugAuthStatus(): void {
    console.log('🔍 DEBUG MONITORING AUTH STATUS:');
    console.log('- Token exists:', !!this.authService.token);
    console.log('- Token preview:', this.authService.token ? this.authService.token.substring(0, 20) + '...' : 'null');
    console.log('- Is logged in:', this.authService.isLoggedIn());
    console.log('- Is token expired:', this.authService.isTokenExpired());
    console.log('- Current user:', this.authService.currentUserValue);
    console.log('- Is admin:', this.authService.isAdmin());
    console.log('- Is super admin:', this.authService.isSuperAdmin());
    
    // Verificar localStorage
    console.log('- localStorage authToken:', localStorage.getItem('authToken'));
    console.log('- localStorage currentUser:', localStorage.getItem('currentUser'));
  }

  // ✅ GET CURRENT STATUS (Síncrono)
  getCurrentPingStatus(): PingStatus | null {
    return this.pingStatusSubject.value;
  }

  getCurrentHealthCheck(): HealthCheck | null {
    return this.healthCheckSubject.value;
  }
}
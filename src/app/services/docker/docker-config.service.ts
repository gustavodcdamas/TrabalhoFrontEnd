// =================================
// DOCKER CONFIGURATION SERVICE
// =================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AppHealth {
  status: 'ok' | 'error';
  checks: {
    api: boolean;
    database: boolean;
    redis: boolean;
  };
  timestamp: string;
  environment: string;
}

export interface DockerInfo {
  isDockerEnvironment: boolean;
  containerName?: string;
  networkMode?: string;
  apiReachable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DockerConfigService {
  private healthSubject = new BehaviorSubject<AppHealth | null>(null);
  public health$ = this.healthSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeHealthCheck();
  }

  // ✅ Detectar se está rodando em ambiente Docker
  isDockerEnvironment(): boolean {
    // Verificações para detectar Docker
    const dockerIndicators = [
      // URL da API não é localhost
      !environment.apiUrl.includes('localhost'),
      // URL da API contém hostnames típicos do Docker
      environment.apiUrl.includes('backend') || 
      environment.apiUrl.includes('api') ||
      environment.apiUrl.includes('server'),
      // Environment de produção
      environment.production,
      // User agent pode conter indicadores Docker (menos confiável)
      navigator.userAgent.includes('Docker') || 
      navigator.userAgent.includes('Container')
    ];

    return dockerIndicators.some(indicator => indicator);
  }

  // ✅ Verificar conectividade com a API
  checkApiConnectivity(): Observable<boolean> {
    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}/health`, {
      withCredentials: true,
      responseType: 'json'
    }).pipe(
      timeout(5000), // ✅ Timeout como operador RxJS
      map(() => {
        const responseTime = Date.now() - startTime;
        console.log(`✅ [DockerConfig] API alcançável em ${responseTime}ms`);
        return true;
      }),
      catchError(error => {
        console.warn(`⚠️ [DockerConfig] API não alcançável:`, error.message);
        return of(false);
      })
    );
  }

  // ✅ Health check completo
  checkAppHealth(): Observable<AppHealth> {
    if (!environment.production) {
      console.log('🏥 [DockerConfig] Verificando saúde da aplicação...');
    }

    return this.http.get<AppHealth>(`${environment.apiUrl}/health`, {
      withCredentials: true,
      responseType: 'json' // ✅ Explicitamente definindo responseType
    }).pipe(
      timeout(10000), // ✅ Timeout como operador RxJS
      tap(health => {
        this.healthSubject.next(health);
        if (!environment.production) {
          console.log('✅ [DockerConfig] Health check:', health);
        }
      }),
      catchError(error => {
        const errorHealth: AppHealth = {
          status: 'error',
          checks: {
            api: false,
            database: false,
            redis: false
          },
          timestamp: new Date().toISOString(),
          environment: environment.production ? 'production' : 'development'
        };
        
        this.healthSubject.next(errorHealth);
        console.error('❌ [DockerConfig] Health check falhou:', error);
        return of(errorHealth);
      })
    );
  }

  // ✅ Informações do ambiente Docker
  getDockerInfo(): Observable<DockerInfo> {
    const isDocker = this.isDockerEnvironment();
    
    if (!isDocker) {
      return of({
        isDockerEnvironment: false,
        apiReachable: true // Assume que local está ok
      });
    }

    return this.checkApiConnectivity().pipe(
      map(apiReachable => ({
        isDockerEnvironment: true,
        containerName: this.extractContainerName(),
        networkMode: this.detectNetworkMode(),
        apiReachable
      }))
    );
  }

  // ✅ Extrair nome do container (se disponível)
  private extractContainerName(): string | undefined {
    // Tentar extrair do hostname ou outras fontes
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return hostname;
      }
    }
    return undefined;
  }

  // ✅ Detectar modo de rede
  private detectNetworkMode(): string | undefined {
    if (environment.apiUrl.includes('backend:')) {
      return 'bridge';
    } else if (environment.apiUrl.includes('host.docker.internal')) {
      return 'host';
    }
    return 'bridge'; // Padrão
  }

  // ✅ Inicializar health check periódico
  private initializeHealthCheck(): void {
    if (environment.production) {
      // Em produção, verificar a cada 5 minutos
      setInterval(() => {
        this.checkAppHealth().subscribe();
      }, 5 * 60 * 1000);
    }
  }

  // ✅ Diagnosticar problemas de conectividade
  diagnoseConnectivity(): Observable<string[]> {
    const issues: string[] = [];
    
    return this.getDockerInfo().pipe(
      map(dockerInfo => {
        if (dockerInfo.isDockerEnvironment) {
          if (!dockerInfo.apiReachable) {
            issues.push('API não está acessível');
            issues.push('Verifique se o container do backend está rodando');
            issues.push('Verifique a configuração de rede do Docker');
          }
          
          if (environment.apiUrl.includes('localhost')) {
            issues.push('URL da API ainda aponta para localhost em ambiente Docker');
            issues.push('Configure a URL da API para usar o hostname do container');
          }
        }
        
        return issues;
      })
    );
  }

  // ✅ Configurações recomendadas para Docker
  getDockerRecommendations(): string[] {
    const recommendations = [];
    
    if (this.isDockerEnvironment()) {
      recommendations.push('✅ Ambiente Docker detectado');
      
      if (environment.apiUrl.includes('localhost')) {
        recommendations.push('⚠️ Considere usar hostname do container em vez de localhost');
      }
      
      if (!environment.production) {
        recommendations.push('💡 Para produção, configure environment.production = true');
      }
    } else {
      recommendations.push('🏠 Ambiente de desenvolvimento local');
      recommendations.push('💡 Para Docker, configure a URL da API adequadamente');
    }
    
    return recommendations;
  }

  // ✅ Logs estruturados para Docker
  logDockerInfo(): void {
    this.getDockerInfo().subscribe(info => {
      console.log('🐳 [DockerConfig] Informações do ambiente:', {
        isDocker: info.isDockerEnvironment,
        apiUrl: environment.apiUrl,
        production: environment.production,
        apiReachable: info.apiReachable,
        containerName: info.containerName,
        networkMode: info.networkMode,
        timestamp: new Date().toISOString()
      });
    });
  }

  // ✅ Método para ajustar configurações dinamicamente
  adjustConfigForDocker(): void {
    if (this.isDockerEnvironment()) {
      // Ajustes específicos para Docker podem ser feitos aqui
      console.log('🐳 [DockerConfig] Aplicando configurações Docker...');
      
      // Exemplo: ajustar timeouts para rede Docker
      const envAny = environment as any;
      if (!envAny.requestTimeout) {
        envAny.requestTimeout = 45000; // 45s para Docker
      }
    }
  }

  // ✅ Método utilitário para health check simples
  quickHealthCheck(): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/health`, {
      withCredentials: true
    }).pipe(
      timeout(3000),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ✅ Método para testar conectividade com diferentes endpoints
  testEndpoints(): Observable<{ endpoint: string; reachable: boolean; responseTime: number }[]> {
    const endpoints = [
      `${environment.apiUrl}/health`,
      `${environment.apiUrl}/api/health`,
      `${environment.apiUrl}/status`
    ];

    const tests = endpoints.map(endpoint => {
      const startTime = Date.now();
      
      return this.http.get(endpoint, {
        withCredentials: true
      }).pipe(
        timeout(5000),
        map(() => ({
          endpoint,
          reachable: true,
          responseTime: Date.now() - startTime
        })),
        catchError(() => of({
          endpoint,
          reachable: false,
          responseTime: Date.now() - startTime
        }))
      );
    });

    // ✅ Usando forkJoin - a forma correta para combinar múltiplos observables
    return forkJoin(tests);
  }

  // ✅ Método para obter informações detalhadas do ambiente
  getEnvironmentInfo(): Observable<{
    isDocker: boolean;
    apiUrl: string;
    production: boolean;
    userAgent: string;
    hostname: string;
    protocol: string;
    port: string;
  }> {
    return this.getDockerInfo().pipe(
      map(dockerInfo => ({
        isDocker: dockerInfo.isDockerEnvironment,
        apiUrl: environment.apiUrl,
        production: environment.production,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port
      }))
    );
  }
}
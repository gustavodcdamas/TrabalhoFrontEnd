// src/app/core/services/environment.service.ts
// Service para gerenciar configurações de ambiente dinamicamente

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RuntimeEnvironment {
  apiUrl: string;
  isProduction: boolean;
  isDocker: boolean;
  backendHost: string;
  contextInfo: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private _runtimeEnv: RuntimeEnvironment;

  constructor() {
    this._runtimeEnv = this.detectRuntimeEnvironment();
    this.logEnvironmentInfo();
  }

  get runtimeEnvironment(): RuntimeEnvironment {
    return this._runtimeEnv;
  }

  get apiUrl(): string {
    return this._runtimeEnv.apiUrl;
  }

  get isProduction(): boolean {
    return this._runtimeEnv.isProduction;
  }

  get isDocker(): boolean {
    return this._runtimeEnv.isDocker;
  }

  private detectRuntimeEnvironment(): RuntimeEnvironment {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;

    // Detectar contexto
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isProductionDomain = hostname.includes('gustavodcdamas.com.br');
    const isDocker = !isLocalhost && !isProductionDomain;

    // Determinar URL da API
    let apiUrl: string;
    let backendHost: string;
    let contextInfo: string;

    if (isProductionDomain) {
      // Produção
      apiUrl = 'http://agencia-backend:3333';
      backendHost = 'agencia-backend';
      contextInfo = 'Produção (Docker interno)';
    } else if (isDocker) {
      // Desenvolvimento com Docker
      apiUrl = 'http://agencia-backend:3333';
      backendHost = 'agencia-backend';
      contextInfo = 'Desenvolvimento (Docker)';
    } else if (isLocalhost) {
      // Desenvolvimento local
      if (this.isBackendInDocker()) {
        // Backend está no Docker, frontend local
        backendHost = this.getDockerHost();
        apiUrl = `http://${backendHost}:3333`;
        contextInfo = 'Desenvolvimento híbrido (Backend Docker)';
      } else {
        // Ambos locais
        backendHost = 'localhost';
        apiUrl = 'http://localhost:3333';
        contextInfo = 'Desenvolvimento local';
      }
    } else {
      // Fallback
      backendHost = hostname;
      apiUrl = `${protocol}//${hostname}:3333`;
      contextInfo = 'Contexto desconhecido';
    }

    return {
      apiUrl,
      isProduction: isProductionDomain,
      isDocker: isDocker || isProductionDomain,
      backendHost,
      contextInfo
    };
  }

  private isBackendInDocker(): boolean {
    // Tentar detectar se o backend está rodando em Docker
    // Isso pode ser feito verificando se certas portas estão mapeadas
    try {
      // Verificar variável de ambiente ou localStorage
      return localStorage.getItem('BACKEND_DOCKER') === 'true' ||
             environment.dockerMode === true;
    } catch {
      return false;
    }
  }

  private getDockerHost(): string {
    // Detectar o host correto para acessar containers Docker
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('windows') || userAgent.includes('mac')) {
      // Windows/Mac com Docker Desktop
      return 'host.docker.internal';
    } else {
      // Linux
      return '172.17.0.1';
    }
  }

  private logEnvironmentInfo(): void {
    if (!environment.production) {
      console.group('🌍 Environment Info');
      console.log('Context:', this._runtimeEnv.contextInfo);
      console.log('API URL:', this._runtimeEnv.apiUrl);
      console.log('Backend Host:', this._runtimeEnv.backendHost);
      console.log('Is Production:', this._runtimeEnv.isProduction);
      console.log('Is Docker:', this._runtimeEnv.isDocker);
      console.log('Window Location:', window.location.href);
      console.groupEnd();
    }
  }

  // Método para testar conectividade
  async testBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        timeout: 5000
      } as any);
      
      return response.ok;
    } catch (error) {
      console.warn('Backend connection test failed:', error);
      return false;
    }
  }

  // Método para fallback de URL da API
  getFallbackApiUrl(): string {
    const alternatives = [
      'http://localhost:3333',
      'http://host.docker.internal:3333',
      'http://172.17.0.1:3333',
      'http://agencia-backend:3333'
    ];

    return alternatives.find(url => url !== this.apiUrl) || alternatives[0];
  }
}
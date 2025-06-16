// src/environments/environment.interface.ts
export interface Environment {
  production: boolean;
  apiUrl: string;
  appUrl: string;
  viaCepUrl: string;
  enableDevTools: boolean;
  logLevel: string;
  
  // ✅ Propriedades adicionais para configurações HTTP
  requestTimeout?: number;
  retryCount?: number;
  enableCsrf?: boolean;
  version?: string;

  timeout: number;        // ✅ Adicione esta linha
  retryAttempts: number;
  
  // ✅ Configurações para Docker/diferentes ambientes
  dockerMode?: boolean;
  backendHost?: string;
  backendPort?: number;
  
  // ✅ Configurações de cache e performance
  cacheTimeout?: number;
  enableServiceWorker?: boolean;
  cacheDuration?: number; // 30 minutos
  
  // ✅ Configurações de segurança
  enableHttps?: boolean;
  corsEnabled?: boolean;
  
  // ✅ URLs de serviços externos
  whatsappApiUrl?: string;
  emailServiceUrl?: string;
  
  // ✅ Configurações de logging
  enableConsoleLog?: boolean;
  enableErrorReporting?: boolean;
}
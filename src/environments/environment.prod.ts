import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'http://agencia-backend:3333',
  appUrl: 'https://gustavodcdamas.com.br',
  viaCepUrl: 'https://viacep.com.br/ws',
  enableDevTools: false,
  logLevel: 'error',
  
  // ✅ Configurações HTTP para produção
  requestTimeout: 60000, // 45 segundos para produção
  retryCount: 2, // Menos tentativas em produção
  enableCsrf: true,
  timeout: 60000,        // Timeout em ms
  retryAttempts: 2,   
  
  // ✅ Configurações para produção
  dockerMode: true,
  backendHost: 'backend', // Nome do serviço Docker
  backendPort: 3333,
  
  // ✅ Configurações de cache e performance
  cacheTimeout: 600000, // 10 minutos em produção
  enableServiceWorker: true,
  cacheDuration: 86400000, // 24horas
  
  // ✅ Configurações de segurança
  enableHttps: true,
  corsEnabled: true,
  
  // ✅ URLs de serviços externos
  whatsappApiUrl: 'https://api.seudominio.com.br/api/whatsapp',
  emailServiceUrl: 'https://api.seudominio.com.br/api/email',
  
  // ✅ Configurações de logging
  enableConsoleLog: false,
  enableErrorReporting: true,
  version: 'string',
};
// src/environments/environment.docker.ts
import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false, // Para desenvolvimento com Docker
  apiUrl: 'http://backend:3333', // Nome do serviço Docker
  appUrl: 'http://localhost:4200',
  viaCepUrl: 'https://viacep.com.br/ws',
  enableDevTools: true,
  logLevel: 'debug',

  // ✅ Configurações HTTP
  requestTimeout: 35000, // Timeout um pouco maior para Docker
  retryCount: 3,
  enableCsrf: true,

  // ✅ Configurações específicas para Docker
  dockerMode: true,
  backendHost: 'backend', // Nome do serviço no docker-compose
  backendPort: 3333,

  // ✅ Configurações de cache e performance
  cacheTimeout: 300000, // 5 minutos
  enableServiceWorker: false,
  cacheDuration: 86400000, // 24horas


  // ✅ Configurações de segurança
  enableHttps: false,
  corsEnabled: true,

  // ✅ URLs de serviços externos (usando nomes dos serviços Docker)
  whatsappApiUrl: 'http://backend:3333/api/whatsapp',
  emailServiceUrl: 'http://backend:3333/api/email',

  // ✅ Configurações de logging
  enableConsoleLog: true,
  enableErrorReporting: false,
  version: '1.0.0',
  timeout: 0,
  retryAttempts: 0
};
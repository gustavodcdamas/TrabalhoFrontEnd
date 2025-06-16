// src/environments/environment.prod.ts
// Environment de produção com detecção localhost

import { Environment } from './environment.interface';

// ✅ LOG PARA VERIFICAR SE ESTÁ SENDO USADO
console.log('🚨 ENVIRONMENT.PROD.TS CARREGADO!');
console.log('🚨 Hostname:', window.location.hostname);

// ✅ DETECÇÃO: Se for localhost, usar localhost:3333
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiUrl = isLocalhost ? 'http://localhost:3333' : 'http://agencia-backend:3333';

console.log('🚨 API URL ESCOLHIDA:', apiUrl);

export const environment: Environment = {
  production: false, // ✅ False para desenvolvimento dockerizado
  
  // ✅ DETECÇÃO AUTOMÁTICA
  apiUrl: apiUrl,
  
  appUrl: window.location.origin,
  viaCepUrl: 'https://viacep.com.br/ws',
  enableDevTools: true,
  logLevel: 'debug',
  
  requestTimeout: 30000,
  retryCount: 3,
  enableCsrf: true,
  timeout: 30000,
  retryAttempts: 3,
  
  dockerMode: !isLocalhost,
  backendHost: isLocalhost ? 'localhost' : 'agencia-backend',
  backendPort: 3333,
  
  cacheTimeout: 300000,
  enableServiceWorker: false,
  cacheDuration: 1800000,
  
  enableHttps: false,
  corsEnabled: true,
  
  whatsappApiUrl: isLocalhost ? 'http://localhost:3333/api/whatsapp' : 'http://agencia-backend:3333/api/whatsapp',
  emailServiceUrl: isLocalhost ? 'http://localhost:3333/api/email' : 'http://agencia-backend:3333/api/email',
  
  enableConsoleLog: true,
  enableErrorReporting: false,
  
  version: '1.0.0',
};
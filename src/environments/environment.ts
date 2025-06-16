// src/environments/environment.ts
// Configuração universal que funciona em DEV e PROD

import { Environment } from './environment.interface';

// Função para detectar o contexto de execução
function detectEnvironment() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  console.log('🔍 Detectando ambiente:', { hostname, port, location: window.location.href });
  
  // Verificar se está rodando em container (acessado via nome do container)
  const isContainerAccess = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('.');
  
  // Verificar se é produção baseado no hostname
  const isProduction = hostname.includes('gustavodcdamas.com.br');
  
  // Verificar se é desenvolvimento local (acessado via localhost)
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Detectar se o backend está no Docker
  const backendHost = isLocalhost ? 'localhost' : getBackendHost();
  
  console.log('🎯 Contexto detectado:', { isContainerAccess, isProduction, isLocalhost, backendHost });
  
  // ✅ CORRIGIDO: Retornar isLocalhost também
  return {
    isDocker: !isLocalhost,
    isProduction,
    isLocalhost,        // ← Adicionar esta propriedade
    backendHost,
    frontendUrl: window.location.origin
  };
}

// Função para detectar o host do backend
function getBackendHost(): string {
  // Tentar diferentes possibilidades para desenvolvimento
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Desenvolvimento local
    return 'localhost';
  }
  
  // Se estiver em Docker mas não é produção (desenvolvimento com Docker)
  try {
    // Verificar se host.docker.internal está disponível (Windows/Mac)
    return 'host.docker.internal';
  } catch {
    // Linux - usar IP da bridge
    return '172.17.0.1';
  }
}

// Detectar contexto atual
const context = detectEnvironment();

export const environment: Environment = {
  production: context.isProduction,
  
  // ✅ CORRIGIDO: URL da API - lógica simplificada
  apiUrl: context.isLocalhost 
    ? 'http://localhost:3333'        // Dev local: backend exposto no host
    : context.isProduction 
    ? 'http://agencia-backend:3333'  // Produção: comunicação interna Docker
    : 'http://agencia-backend:3333', // Dev Docker: comunicação interna
  
  // URL da aplicação
  appUrl: context.frontendUrl,
  
  // URLs externas (sempre iguais)
  viaCepUrl: 'https://viacep.com.br/ws',
  
  // Configurações baseadas no ambiente
  enableDevTools: !context.isProduction,
  logLevel: context.isProduction ? 'error' : 'debug',
  
  // Configurações HTTP adaptáveis
  requestTimeout: context.isProduction ? 60000 : 30000,
  retryCount: context.isProduction ? 2 : 3,
  enableCsrf: true,
  timeout: context.isProduction ? 60000 : 30000,
  retryAttempts: context.isProduction ? 2 : 3,
  
  // Detecção automática do modo Docker
  dockerMode: context.isDocker,
  backendHost: context.backendHost,
  backendPort: 3333,
  
  // Cache e performance
  cacheTimeout: context.isProduction ? 600000 : 300000,
  enableServiceWorker: context.isProduction,
  cacheDuration: context.isProduction ? 86400000 : 30 * 60 * 1000,
  
  // Segurança
  enableHttps: context.isProduction,
  corsEnabled: true,
  
  // ✅ CORRIGIDO: URLs de serviços - lógica simplificada
  whatsappApiUrl: context.isLocalhost
    ? 'http://localhost:3333/api/whatsapp'
    : 'http://agencia-backend:3333/api/whatsapp',
    
  emailServiceUrl: context.isLocalhost
    ? 'http://localhost:3333/api/email'
    : 'http://agencia-backend:3333/api/email',
  
  // Logging
  enableConsoleLog: !context.isProduction,
  enableErrorReporting: context.isProduction,
  
  version: '1.0.0',
};
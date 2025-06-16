// src/environments/environment.ts
// Configuração universal que funciona em DEV e PROD

import { Environment } from './environment.interface';

// Função para detectar o contexto de execução
function detectEnvironment() {
  // Verificar se está rodando em container
  const isDocker = window.location.hostname !== 'localhost' && 
                   window.location.hostname !== '127.0.0.1';
  
  // Verificar se é produção baseado no hostname
  const isProduction = window.location.hostname.includes('gustavodcdamas.com.br');
  
  // Detectar se o backend está no Docker
  const backendHost = isDocker ? 'agencia-backend' : getBackendHost();
  
  return {
    isDocker,
    isProduction,
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
  
  // URL da API - lógica universal
  apiUrl: context.isDocker && context.isProduction 
    ? 'http://agencia-backend:3333'  // Produção: comunicação interna Docker
    : context.isDocker 
    ? 'http://agencia-backend:3333'  // Dev Docker: comunicação interna
    : `http://${context.backendHost}:3333`, // Dev local: host detection
  
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
  
  // URLs de serviços - detecção automática
  whatsappApiUrl: context.isDocker && context.isProduction
    ? 'http://agencia-backend:3333/api/whatsapp'
    : `http://${context.backendHost}:3333/api/whatsapp`,
    
  emailServiceUrl: context.isDocker && context.isProduction
    ? 'http://agencia-backend:3333/api/email'
    : `http://${context.backendHost}:3333/api/email`,
  
  // Logging
  enableConsoleLog: !context.isProduction,
  enableErrorReporting: context.isProduction,
  
  version: '1.0.0',
};
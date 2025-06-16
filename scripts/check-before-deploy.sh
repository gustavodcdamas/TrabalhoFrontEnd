#!/bin/bash

echo "🔍 Verificando configurações antes do deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Função para verificar erro
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ $1${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ $1${NC}"
    fi
}

# Função para warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "📋 Verificando arquivos necessários..."

# Verificar se arquivos essenciais existem
[ -f ".env" ] && check_error "Arquivo .env encontrado" || warning "Arquivo .env não encontrado - usando .env.example"
[ -f "docker-compose.yml" ] && check_error "docker-compose.yml encontrado" || check_error "docker-compose.yml não encontrado"
[ -f "frontend/Dockerfile" ] && check_error "Dockerfile do frontend encontrado" || check_error "Dockerfile do frontend não encontrado"
[ -f "backend/Dockerfile" ] && check_error "Dockerfile do backend encontrado" || check_error "Dockerfile do backend não encontrado"

echo ""
echo "🔧 Verificando configurações do Docker..."

# Verificar se Docker está rodando
docker info > /dev/null 2>&1
check_error "Docker está rodando"

# Verificar se Docker Compose está disponível
docker-compose version > /dev/null 2>&1
check_error "Docker Compose está disponível"

echo ""
echo "🌐 Verificando configurações de rede..."

# Verificar variáveis de ambiente críticas
if [ -f ".env" ]; then
    source .env
    
    # Verificar DATABASE_URL
    [ ! -z "$DATABASE_URL" ] && check_error "DATABASE_URL configurado" || warning "DATABASE_URL não configurado"
    
    # Verificar REDIS_URL
    [ ! -z "$REDIS_URL" ] && check_error "REDIS_URL configurado" || warning "REDIS_URL não configurado"
    
    # Verificar JWT_SECRET
    [ ! -z "$JWT_SECRET" ] && check_error "JWT_SECRET configurado" || warning "JWT_SECRET não configurado"
    
    # Verificar senhas
    [ ! -z "$POSTGRES_PASSWORD" ] && check_error "POSTGRES_PASSWORD configurado" || warning "POSTGRES_PASSWORD não configurado"
    [ ! -z "$REDIS_PASSWORD" ] && check_error "REDIS_PASSWORD configurado" || warning "REDIS_PASSWORD não configurado"
    
    # Verificar se senhas não são padrão
    if [ "$POSTGRES_PASSWORD" = "password" ] || [ "$POSTGRES_PASSWORD" = "123456" ]; then
        warning "POSTGRES_PASSWORD usando valor padrão inseguro"
    fi
fi

echo ""
echo "📦 Verificando configurações dos serviços..."

# Verificar se as portas não estão em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        warning "Porta $1 já está em uso"
    else
        echo -e "${GREEN}✅ Porta $1 disponível${NC}"
    fi
}

check_port 3000  # Backend
check_port 5432  # PostgreSQL
check_port 6379  # Redis
check_port 80    # Frontend/Nginx

echo ""
echo "🔍 Verificando configurações do frontend..."

# Verificar se o build do Angular está configurado corretamente
if [ -f "frontend/angular.json" ]; then
    if grep -q "\"buildOptimizer\": true" frontend/angular.json; then
        check_error "Build optimizer habilitado no Angular"
    else
        warning "Build optimizer não configurado no Angular"
    fi
fi

# Verificar configuração de proxy do Angular
if [ -f "frontend/proxy.conf.json" ]; then
    check_error "Configuração de proxy encontrada"
else
    warning "Configuração de proxy não encontrada"
fi

echo ""
echo "🔍 Verificando configurações do backend..."

# Verificar se o main.ts está configurado para Docker
if [ -f "backend/src/main.ts" ]; then
    if grep -q "0.0.0.0" backend/src/main.ts; then
        check_error "Backend configurado para aceitar conexões de qualquer IP"
    else
        warning "Backend pode não estar configurado para Docker (verificar bind 0.0.0.0)"
    fi
fi

# Verificar health check endpoint
if [ -f "backend/src/main.ts" ]; then
    if grep -q "/health" backend/src/main.ts; then
        check_error "Health check endpoint configurado"
    else
        warning "Health check endpoint não encontrado"
    fi
fi

echo ""
echo "📊 Resumo das verificações:"
echo "=================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Todas as verificações passaram! Pronto para deploy.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) encontrado(s), mas pode prosseguir com o deploy.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s). Corrija antes de fazer o deploy.${NC}"
    [ $WARNINGS -gt 0 ] && echo -e "${YELLOW}⚠️  $WARNINGS warning(s) também encontrado(s).${NC}"
    exit 1
fi
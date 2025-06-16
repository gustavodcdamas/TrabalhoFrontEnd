#!/bin/bash
# scripts/universal.sh - Atualizado para .env unificado

# Função para criar link do .env
link_env() {
    local env_file=$1
    echo "🔗 Configurando ambiente: $env_file"
    
    # Remover link existente
    rm -f .env
    
    # Criar novo link
    ln -sf "$env_file" .env
    
    echo "✅ Ambiente configurado: $env_file"
}

# Desenvolvimento híbrido (recomendado)
dev_hybrid() {
    log "🔄 Iniciando desenvolvimento híbrido..."
    
    # Configurar ambiente
    link_env ".env.development"
    
    # Exportar variáveis
    export $(cat .env.development | grep -v '^#' | xargs)
    
    # Iniciar apenas backend e banco
    docker-compose up agencia-backend agencia-postgres agencia-redis -d
    
    # Aguardar serviços
    log "Aguardando serviços inicializarem..."
    sleep 15
    
    # Verificar backend
    if curl -f http://localhost:3333/health &> /dev/null; then
        log "Backend rodando ✅"
        
        # Marcar que backend está no Docker
        mkdir -p frontend/src/environments
        echo "export const dockerMode = true;" > frontend/src/environments/docker-flag.ts
        
        # Iniciar frontend localmente
        log "Iniciando frontend localmente..."
        cd frontend && npm start
    else
        error "Backend não conseguiu inicializar"
    fi
}

# Desenvolvimento completo com Docker
dev_docker() {
    log "🐳 Iniciando desenvolvimento Docker completo..."
    
    # Configurar ambiente
    link_env ".env.docker-dev"
    
    # Iniciar todos os serviços
    docker-compose --env-file .env.docker-dev up --build
}

# Produção
prod() {
    log "🚀 Iniciando produção..."
    
    # Verificar arquivo de produção
    if [[ ! -f .env.production ]]; then
        error "Arquivo .env.production não encontrado"
    fi
    
    # Configurar ambiente
    link_env ".env.production"
    
    # Verificar variáveis críticas
    source .env.production
    if [[ "$JWT_SECRET" == *"SUA_CHAVE"* ]]; then
        error "Configure as chaves de segurança no .env.production"
    fi
    
    # Iniciar em produção
    docker-compose --env-file .env.production up -d --build --remove-orphans
}

# Verificar configuração
check_env() {
    log "🔍 Verificando configuração atual..."
    
    if [[ -L .env ]]; then
        local target=$(readlink .env)
        log "Ambiente atual: $target"
    elif [[ -f .env ]]; then
        warn ".env existe mas não é um link simbólico"
    else
        warn "Nenhum arquivo .env encontrado"
    fi
    
    echo ""
    echo "=== Variáveis principais ==="
    echo "NODE_ENV: ${NODE_ENV:-não definido}"
    echo "FRONTEND_PORT: ${FRONTEND_PORT:-não definido}"
    echo "BACKEND_PORT_MAP: ${BACKEND_PORT_MAP:-não definido}"
    echo "DB_HOST: ${DB_HOST:-não definido}"
    echo "DATABASE_URL: ${DATABASE_URL:-não definido}"
}

# Desenvolvimento local completo
dev_local() {
    log "💻 Iniciando desenvolvimento local..."
    
    # Configurar ambiente para modo híbrido
    link_env ".env.development"
    export $(cat .env.development | grep -v '^#' | xargs)
    
    # Apenas banco e redis no Docker
    docker-compose up agencia-postgres agencia-redis -d
    
    log "Serviços Docker iniciados:"
    log "- PostgreSQL: localhost:5433"
    log "- Redis: localhost:6380"
    log ""
    log "Configure seu backend com:"
    log "DATABASE_URL=postgresql://dev_user:dev_password@localhost:5433/agencia_dev"
    log "REDIS_URL=redis://localhost:6380"
    log ""
    warn "Inicie manualmente:"
    warn "Backend: cd backend && npm run start:dev"
    warn "Frontend: cd frontend && npm start"
}

# Status detalhado
status() {
    log "📊 Status completo dos serviços..."
    
    # Verificar ambiente atual
    check_env
    
    echo ""
    echo "=== Containers ==="
    docker ps --filter "name=agencia" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "=== Saúde dos serviços ==="
    
    # Testar backend
    if curl -f http://localhost:3333/health &> /dev/null; then
        echo "✅ Backend: http://localhost:3333"
    else
        echo "❌ Backend: Não acessível"
    fi
    
    # Testar frontend
    if curl -f http://localhost:3535 &> /dev/null; then
        echo "✅ Frontend: http://localhost:3535"
    else
        echo "❌ Frontend: Não acessível"
    fi
    
    # Testar banco
    if docker exec agencia-postgres pg_isready -U "${DB_USERNAME:-dev_user}" -d "${DB_NAME:-agencia_dev}" &> /dev/null; then
        echo "✅ Database: Conectado"
    else
        echo "❌ Database: Não conectado"
    fi
    
    # Testar Redis
    if docker exec agencia-redis redis-cli ping &> /dev/null; then
        echo "✅ Redis: Conectado"
    else
        echo "❌ Redis: Não conectado"
    fi
}

# Menu atualizado
main() {
    case "$1" in
        "hybrid")
            dev_hybrid
            ;;
        "docker")
            dev_docker
            ;;
        "local")
            dev_local
            ;;
        "prod")
            prod
            ;;
        "check")
            check_env
            ;;
        "status")
            status
            ;;
        *)
            echo "🛠️  Script Universal - Versão com .env Unificado"
            echo ""
            echo "Uso: $0 {hybrid|docker|local|prod|check|status|clean|logs}"
            echo ""
            echo "Comandos:"
            echo "  hybrid  - Backend Docker + Frontend local (.env.development)"
            echo "  docker  - Tudo no Docker (.env.docker-dev)"
            echo "  local   - Apenas serviços no Docker (.env.development)"
            echo "  prod    - Modo produção (.env.production)"
            echo "  check   - Verificar configuração atual"
            echo "  status  - Status completo dos serviços"
            echo "  clean   - Limpar containers"
            echo "  logs    - Ver logs"
            ;;
    esac
}

# Executar
main "$@"
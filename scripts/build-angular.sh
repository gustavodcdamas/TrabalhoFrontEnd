#!/bin/bash

# Configurações
DOCKER_USERNAME="seu-usuario-dockerhub"
APP_NAME="agencia-frontend"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

# URLs para diferentes ambientes
case $ENVIRONMENT in
  "production")
    API_URL="http://backend:3000"
    APP_URL="https://gustavodcdamas.com.br"
    ;;
  "staging")
    API_URL="http://backend:3000"
    APP_URL="https://staging.gustavodcdamas.com.br"
    ;;
  "development")
    API_URL="http://localhost:3333"
    APP_URL="http://localhost:4200"
    ;;
  *)
    echo "❌ Ambiente inválido: $ENVIRONMENT"
    echo "Use: production, staging, ou development"
    exit 1
    ;;
esac

IMAGE_NAME="$DOCKER_USERNAME/$APP_NAME:$VERSION"

echo "🚀 Buildando Angular para Docker..."
echo "📦 Imagem: $IMAGE_NAME"
echo "🌍 Ambiente: $ENVIRONMENT"
echo "🔗 API URL: $API_URL"
echo "🏠 APP URL: $APP_URL"

# Habilita BuildKit
export DOCKER_BUILDKIT=1

# Verifica se está no diretório correto
if [ ! -f "angular.json" ]; then
    echo "❌ Erro: angular.json não encontrado!"
    echo "Execute o script no diretório raiz do projeto Angular"
    exit 1
fi

# ✅ CORRIGE o nome da pasta dist no Dockerfile
DIST_FOLDER=$(node -p "require('./angular.json').projects[Object.keys(require('./angular.json').projects)[0]].architect.build.options.outputPath.split('/').pop()")
echo "📁 Pasta dist detectada: $DIST_FOLDER"

# Cria Dockerfile temporário com nome correto
sed "s/seu-app/$DIST_FOLDER/g" Dockerfile > Dockerfile.tmp

# Build da imagem
echo "🔨 Fazendo build da imagem..."
docker build \
    --platform linux/amd64 \
    --build-arg BUILD_ENV=$ENVIRONMENT \
    --build-arg API_URL=$API_URL \
    --build-arg APP_URL=$APP_URL \
    --cache-from $IMAGE_NAME \
    -t $IMAGE_NAME \
    -f Dockerfile.tmp \
    .

# Remove Dockerfile temporário
rm -f Dockerfile.tmp

# Verifica se o build foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "❌ Erro no build da imagem!"
    exit 1
fi

# Testa a imagem
echo "🧪 Testando a imagem..."
CONTAINER_ID=$(docker run -d --rm -p 8081:8080 $IMAGE_NAME)
sleep 5

if curl -f http://localhost:8081 &> /dev/null; then
    echo "✅ Teste passou!"
else
    echo "⚠️  Teste falhou - verificar configuração"
fi

docker stop $CONTAINER_ID &> /dev/null

# Analisa tamanho
IMAGE_SIZE=$(docker image inspect $IMAGE_NAME --format='{{.Size}}' | numfmt --to=iec)
echo "📊 Tamanho da imagem: $IMAGE_SIZE"

# Pergunta se deve fazer push
read -p "🚀 Fazer push para Docker Hub? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker push $IMAGE_NAME
    echo "✅ Push realizado com sucesso!"
fi

echo ""
echo "🎉 Build concluído!"
echo "📦 Imagem: $IMAGE_NAME"
echo "🌍 Ambiente: $ENVIRONMENT"
echo "📏 Tamanho: $IMAGE_SIZE"
# Estágio 1: Build da aplicação Angular
FROM node:18-alpine AS build

# Instalar dependências de build
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --prefer-offline --no-audit --progress=false

# Copiar código fonte
COPY . .

# Argumentos de build para diferentes ambientes
ARG BUILD_ENV=production
ARG NODE_ENV=production

# Build da aplicação usando environment universal
# Como você usa detecção automática, não precisa passar variáveis específicas
RUN npm run build -- \
    --configuration=${BUILD_ENV} \
    --aot \
    --build-optimizer \
    --output-hashing=all \
    --extract-licenses \
    --source-map=false

# Limpar dependências de build
RUN apk del .build-deps && \
    rm -rf node_modules

# Estágio 2: Servidor web Nginx (leve para container interno)
FROM nginx:alpine

# Remover configurações padrão do nginx
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# Criar usuário não-root
RUN addgroup -g 1001 -S angular && \
    adduser -S angular -u 1001 -G angular

# IMPORTANTE: Ajustar para o nome real do seu projeto Angular
# Verificar em angular.json qual é o "outputPath"
COPY --from=build --chown=angular:angular /app/dist/agencia-frontend /usr/share/nginx/html

# Configuração nginx interna (simples, pois nginx externo fará proxy)
COPY --chown=angular:angular <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3535;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Configuração para Angular SPA
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers básicos
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }

    # Assets estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Ajustar permissões
RUN chown -R angular:angular /usr/share/nginx/html && \
    chown -R angular:angular /var/cache/nginx && \
    chown -R angular:angular /var/log/nginx && \
    chown -R angular:angular /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R angular:angular /var/run/nginx.pid

# Usar usuário não-root
USER angular

EXPOSE 3535

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3535/health || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
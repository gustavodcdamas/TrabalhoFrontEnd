#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verifica se arquivos de environment existem
const environments = [
  'environment.ts',
  'environment.dev.ts',
  'environment.docker-dev.ts',
  'environment.homolog.ts',
  'environment.staging.ts',
  'environment.prod.ts'
];

const environmentsPath = path.join(__dirname, '../src/environments');

log('\n🔍 Verificando arquivos de environment...', 'cyan');
log('==========================================\n', 'cyan');

let allFilesExist = true;
let errors = [];
let warnings = [];

environments.forEach(envFile => {
  const filePath = path.join(environmentsPath, envFile);
  
  if (fs.existsSync(filePath)) {
    log(`✅ ${envFile}`, 'green');
    
    // Verifica conteúdo do arquivo
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verifica se tem apiUrl
      if (!content.includes('apiUrl')) {
        warnings.push(`⚠️  ${envFile}: apiUrl não encontrado`);
      }
      
      // Verifica se tem appUrl
      if (!content.includes('appUrl')) {
        warnings.push(`⚠️  ${envFile}: appUrl não encontrado`);
      }
      
      // Verifica URLs localhost em produção
      if (envFile === 'environment.prod.ts' && content.includes('localhost')) {
        errors.push(`❌ ${envFile}: Contém URLs localhost em produção!`);
      }
      
      // Verifica se production está correto
      if (envFile === 'environment.prod.ts' && !content.includes('production: true')) {
        errors.push(`❌ ${envFile}: production deve ser true`);
      }
      
    } catch (error) {
      errors.push(`❌ Erro ao ler ${envFile}: ${error.message}`);
    }
    
  } else {
    log(`❌ ${envFile}`, 'red');
    errors.push(`❌ Arquivo ${envFile} não encontrado`);
    allFilesExist = false;
  }
});

// Verifica angular.json
log('\n🔍 Verificando angular.json...', 'cyan');
const angularJsonPath = path.join(__dirname, '../angular.json');

if (fs.existsSync(angularJsonPath)) {
  log('✅ angular.json encontrado', 'green');
  
  try {
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
    const projectName = Object.keys(angularJson.projects)[0];
    const buildConfigs = angularJson.projects[projectName]?.architect?.build?.configurations;
    
    if (buildConfigs) {
      const expectedConfigs = ['production', 'staging', 'development', 'docker-dev', 'homolog'];
      
      expectedConfigs.forEach(config => {
        if (buildConfigs[config]) {
          log(`  ✅ Configuração '${config}' encontrada`, 'green');
        } else {
          warnings.push(`⚠️  Configuração '${config}' não encontrada no angular.json`);
        }
      });
    }
    
  } catch (error) {
    errors.push(`❌ Erro ao ler angular.json: ${error.message}`);
  }
  
} else {
  errors.push('❌ angular.json não encontrado');
}

// Verifica package.json
log('\n🔍 Verificando package.json...', 'cyan');
const packageJsonPath = path.join(__dirname, '../package.json');

if (fs.existsSync(packageJsonPath)) {
  log('✅ package.json encontrado', 'green');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const expectedScripts = [
      'build:dev',
      'build:staging', 
      'build:prod',
      'dev',
      'docker:build'
    ];
    
    expectedScripts.forEach(script => {
      if (scripts[script]) {
        log(`  ✅ Script '${script}' encontrado`, 'green');
      } else {
        warnings.push(`⚠️  Script '${script}' não encontrado no package.json`);
      }
    });
    
  } catch (error) {
    errors.push(`❌ Erro ao ler package.json: ${error.message}`);
  }
  
} else {
  errors.push('❌ package.json não encontrado');
}

// Resumo
log('\n📊 Resumo da verificação:', 'cyan');
log('========================\n', 'cyan');

if (errors.length === 0 && warnings.length === 0) {
  log('🎉 Tudo perfeito! Configuração pronta para Docker.', 'green');
} else {
  if (errors.length > 0) {
    log('❌ ERROS ENCONTRADOS:', 'red');
    errors.forEach(error => log(error, 'red'));
    log('', 'reset');
  }
  
  if (warnings.length > 0) {
    log('⚠️  AVISOS:', 'yellow');
    warnings.forEach(warning => log(warning, 'yellow'));
    log('', 'reset');
  }
}

// Comandos úteis
log('📝 Comandos úteis:', 'magenta');
log('=================', 'magenta');
log('npm run dev                  # Desenvolvimento local', 'blue');
log('npm run dev:docker           # Desenvolvimento com Docker', 'blue');
log('npm run build:staging        # Build para staging', 'blue');
log('npm run build:prod           # Build para produção', 'blue');
log('npm run docker:build:prod    # Build da imagem Docker para produção', 'blue');

// Exit code
process.exit(errors.length > 0 ? 1 : 0);
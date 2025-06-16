// =================================
// MONITORING COMPONENT - CORRIGIDO
// =================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, timer } from 'rxjs';
import { HealthCheck, MonitoringService, PingStatus, SystemInfo, Metrics, LogResponse } from 'src/app/services/monitoramento/monitoramento.service';

@Component({
  selector: 'app-monitoring',
  standalone: true, // Se estiver usando standalone components
  imports: [CommonModule, FormsModule], // Adiciona os imports necessários
  template: `
    <div class="monitoring-container">
      <div class="monitoring-header">
        <h1>🔧 Monitoramento do Sistema</h1>
        <div class="header-actions">
          <button 
            class="refresh-btn" 
            (click)="forceRefresh()" 
            [disabled]="refreshing">
            <i class="icon-refresh" [class.spinning]="refreshing"></i>
            {{ refreshing ? 'Atualizando...' : 'Atualizar' }}
          </button>
          <span class="last-update">
            Última atualização: {{ lastUpdate | date:'HH:mm:ss' }}
          </span>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <nav class="tabs">
          <button 
            *ngFor="let tab of tabs" 
            [class.active]="activeTab === tab.id"
            (click)="switchTab(tab.id)"
            class="tab-button">
            <i [class]="tab.icon"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- PING TAB -->
        <div *ngIf="activeTab === 'ping'" class="ping-tab">
          <div class="ping-header">
            <h2>🏓 Status dos Serviços (Ping)</h2>
            <p class="ping-description">
              Testa a conectividade com cada serviço individualmente
            </p>
          </div>
          
          <div class="ping-grid">
            <!-- Backend Status -->
            <div class="ping-card backend" 
                 [class.pong]="pingStatus?.backend?.status === 'pong'" 
                 [class.not-pong]="pingStatus?.backend?.status === 'not_pong'">
              <div class="ping-card-header">
                <h3>🖥️ Backend</h3>
                <div class="status-badge" [class.pong]="pingStatus?.backend?.status === 'pong'">
                  {{ pingStatus?.backend?.status === 'pong' ? 'PONG' : 'NOT PONG' }}
                </div>
              </div>
              <div class="ping-details">
                <p><strong>Tempo de Resposta:</strong> {{ pingStatus?.backend?.responseTime || 0 }}ms</p>
                <p><strong>Última Verificação:</strong> {{ pingStatus?.backend?.timestamp | date:'HH:mm:ss' }}</p>
              </div>
            </div>

            <!-- Redis Status -->
            <div class="ping-card redis" 
                 [class.pong]="pingStatus?.redis?.status === 'pong'" 
                 [class.not-pong]="pingStatus?.redis?.status === 'not_pong'">
              <div class="ping-card-header">
                <h3>🔴 Redis</h3>
                <div class="status-badge" [class.pong]="pingStatus?.redis?.status === 'pong'">
                  {{ pingStatus?.redis?.status === 'pong' ? 'PONG' : 'NOT PONG' }}
                </div>
              </div>
              <div class="ping-details">
                <p><strong>Tempo de Resposta:</strong> {{ pingStatus?.redis?.responseTime || 0 }}ms</p>
                <p><strong>Última Verificação:</strong> {{ pingStatus?.redis?.timestamp | date:'HH:mm:ss' }}</p>
                <p *ngIf="pingStatus?.redis?.error" class="error-message">
                  <strong>Erro:</strong> {{ pingStatus?.redis?.error }}
                </p>
              </div>
            </div>

            <!-- Database Status -->
            <div class="ping-card database" 
                 [class.pong]="pingStatus?.database?.status === 'pong'" 
                 [class.not-pong]="pingStatus?.database?.status === 'not_pong'">
              <div class="ping-card-header">
                <h3>🗄️ Banco de Dados</h3>
                <div class="status-badge" [class.pong]="pingStatus?.database?.status === 'pong'">
                  {{ pingStatus?.database?.status === 'pong' ? 'PONG' : 'NOT PONG' }}
                </div>
              </div>
              <div class="ping-details">
                <p><strong>Tempo de Resposta:</strong> {{ pingStatus?.database?.responseTime || 0 }}ms</p>
                <p><strong>Última Verificação:</strong> {{ pingStatus?.database?.timestamp | date:'HH:mm:ss' }}</p>
                <p *ngIf="pingStatus?.database?.error" class="error-message">
                  <strong>Erro:</strong> {{ pingStatus?.database?.error }}
                </p>
              </div>
            </div>
          </div>

          <!-- Resumo Geral -->
          <div class="ping-summary">
            <div class="summary-card" [class]="getOverallPingStatus()">
              <h3>📊 Resumo Geral</h3>
              <p><strong>Status:</strong> {{ getOverallPingStatusText() }}</p>
              <p><strong>Serviços Online:</strong> {{ getOnlineServicesCount() }}/3</p>
              <p><strong>Tempo Médio de Resposta:</strong> {{ getAverageResponseTime() }}ms</p>
            </div>
          </div>
        </div>

        <!-- HEALTH CHECK TAB -->
        <div *ngIf="activeTab === 'health'" class="health-tab">
          <div class="health-header">
            <h2>🏥 Health Check Completo</h2>
            <p class="health-description">
              Verificação completa da saúde do sistema
            </p>
          </div>

          <div class="health-overview">
            <div class="health-status-card" [class]="healthCheck?.status">
              <div class="health-icon">
                <i [class]="getHealthIcon()"></i>
              </div>
              <div class="health-info">
                <h3>Status Geral</h3>
                <p class="status-text">{{ getHealthStatusText() }}</p>
                <p class="status-description">{{ getHealthStatusDescription() }}</p>
              </div>
            </div>
          </div>

          <div class="health-details-grid">
            <div class="health-detail-card">
              <h4>🖥️ Sistema</h4>
              <p><strong>Uptime:</strong> {{ formatUptime(healthCheck?.uptime || 0) }}</p>
              <p><strong>Versão:</strong> {{ healthCheck?.version || 'N/A' }}</p>
              <p><strong>Ambiente:</strong> {{ healthCheck?.environment || 'N/A' }}</p>
              <p><strong>Última Verificação:</strong> {{ healthCheck?.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</p>
            </div>

            <div class="health-detail-card">
              <h4>📊 Serviços</h4>
              <div class="service-list">
                <div class="service-item" 
                     [class.online]="healthCheck?.checks?.backend?.status === 'pong'" 
                     [class.offline]="healthCheck?.checks?.backend?.status === 'not_pong'">
                  <span class="service-name">Backend</span>
                  <span class="service-status">{{ healthCheck?.checks?.backend?.status === 'pong' ? 'Online' : 'Offline' }}</span>
                </div>
                <div class="service-item" 
                     [class.online]="healthCheck?.checks?.redis?.status === 'pong'" 
                     [class.offline]="healthCheck?.checks?.redis?.status === 'not_pong'">
                  <span class="service-name">Redis</span>
                  <span class="service-status">{{ healthCheck?.checks?.redis?.status === 'pong' ? 'Online' : 'Offline' }}</span>
                </div>
                <div class="service-item" 
                     [class.online]="healthCheck?.checks?.database?.status === 'pong'" 
                     [class.offline]="healthCheck?.checks?.database?.status === 'not_pong'">
                  <span class="service-name">Database</span>
                  <span class="service-status">{{ healthCheck?.checks?.database?.status === 'pong' ? 'Online' : 'Offline' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LOGS TAB -->
        <div *ngIf="activeTab === 'logs'" class="logs-tab">
          <div class="logs-header">
            <h2>📋 Logs do Sistema</h2>
            <div class="logs-filters">
              <select [(ngModel)]="logFilters.level" (change)="loadLogs()">
                <option value="">Todos os níveis</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
              <select [(ngModel)]="logFilters.service" (change)="loadLogs()">
                <option value="">Todos os serviços</option>
                <option value="auth">Autenticação</option>
                <option value="user">Usuários</option>
                <option value="monitoring">Monitoramento</option>
              </select>
              <input 
                type="number" 
                [(ngModel)]="logFilters.limit" 
                (change)="loadLogs()"
                placeholder="Limite (100)"
                min="10" 
                max="1000">
              <button (click)="loadLogs()" class="load-logs-btn">🔄 Carregar</button>
            </div>
          </div>

          <div class="logs-container">
            <div class="logs-info">
              <p><strong>Total:</strong> {{ logsData?.total || 0 }} | <strong>Exibindo:</strong> {{ logsData?.filtered || 0 }}</p>
            </div>
            
            <div class="logs-list">
              <div 
                *ngFor="let log of logsData?.logs" 
                class="log-entry"
                [class.error]="log.content.toLowerCase().includes('error')"
                [class.warn]="log.content.toLowerCase().includes('warn')"
                [class.info]="log.content.toLowerCase().includes('info')">
                <div class="log-timestamp">{{ log.timestamp | date:'HH:mm:ss' }}</div>
                <div class="log-content">{{ log.content }}</div>
              </div>
            </div>
            
            <div *ngIf="!logsData?.logs?.length" class="no-logs">
              <p>📝 Nenhum log encontrado com os filtros aplicados</p>
            </div>
          </div>
        </div>

        <!-- SYSTEM INFO TAB -->
        <div *ngIf="activeTab === 'system'" class="system-tab">
          <div class="system-header">
            <h2>💻 Informações do Sistema</h2>
          </div>

          <div class="system-grid">
            <!-- Node.js Info -->
            <div class="system-card">
              <h3>🟢 Node.js</h3>
              <div class="system-details">
                <p><strong>Versão:</strong> {{ systemInfo?.node?.version || 'N/A' }}</p>
                <p><strong>Plataforma:</strong> {{ systemInfo?.node?.platform || 'N/A' }}</p>
                <p><strong>Arquitetura:</strong> {{ systemInfo?.node?.arch || 'N/A' }}</p>
                <p><strong>Uptime:</strong> {{ formatUptime(systemInfo?.node?.uptime || 0) }}</p>
              </div>
            </div>

            <!-- Memory Info -->
            <div class="system-card">
              <h3>🧠 Memória</h3>
              <div class="system-details">
                <p><strong>RSS:</strong> {{ systemInfo?.memory?.rss || 'N/A' }}</p>
                <p><strong>Heap Total:</strong> {{ systemInfo?.memory?.heapTotal || 'N/A' }}</p>
                <p><strong>Heap Usado:</strong> {{ systemInfo?.memory?.heapUsed || 'N/A' }}</p>
                <p><strong>Uso (%):</strong> {{ systemInfo?.memory?.usagePercent || 0 }}%</p>
                <div class="memory-bar">
                  <div class="memory-usage" [style.width.%]="systemInfo?.memory?.usagePercent || 0"></div>
                </div>
              </div>
            </div>

            <!-- Environment Info -->
            <div class="system-card">
              <h3>🌍 Ambiente</h3>
              <div class="system-details">
                <p><strong>NODE_ENV:</strong> {{ systemInfo?.environment?.nodeEnv || 'N/A' }}</p>
                <p><strong>Porta:</strong> {{ systemInfo?.environment?.port || 'N/A' }}</p>
                <p><strong>Timezone:</strong> {{ systemInfo?.environment?.timezone || 'N/A' }}</p>
              </div>
            </div>

            <!-- Docker Info -->
            <div class="system-card">
              <h3>🐳 Docker</h3>
              <div class="system-details">
                <p><strong>Container:</strong> {{ systemInfo?.docker?.isDocker ? 'Sim' : 'Não' }}</p>
                <p *ngIf="systemInfo?.docker?.hostname"><strong>Hostname:</strong> {{ systemInfo?.docker?.hostname }}</p>
                <div class="docker-status" [class.active]="systemInfo?.docker?.isDocker">
                  {{ systemInfo?.docker?.isDocker ? '✅ Rodando em Docker' : '❌ Não está em Docker' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics -->
          <div class="metrics-section" *ngIf="metrics">
            <h3>📊 Métricas</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <h4>👥 Usuários</h4>
                <p class="metric-value">{{ metrics.users?.total || 0 }}</p>
                <p class="metric-label">Total de Usuários</p>
              </div>
              <div class="metric-card">
                <h4>👨‍💼 Admins</h4>
                <p class="metric-value">{{ metrics.users?.admins || 0 }}</p>
                <p class="metric-label">Administradores</p>
              </div>
              <div class="metric-card">
                <h4>⏱️ Uptime</h4>
                <p class="metric-value">{{ formatUptime(metrics.system?.uptime || 0) }}</p>
                <p class="metric-label">Tempo Online</p>
              </div>
              <div class="metric-card">
                <h4>💾 Memória</h4>
                <p class="metric-value">{{ formatBytes(metrics.system?.memoryUsage || 0) }}</p>
                <p class="metric-label">Uso de Memória</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./monitoramento.component.css']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data - tipadas corretamente
  pingStatus: PingStatus | null = null;
  healthCheck: HealthCheck | null = null;
  logsData: LogResponse | null = null;
  systemInfo: SystemInfo | null = null;
  metrics: Metrics | null = null;
  
  // UI State
  activeTab = 'ping';
  refreshing = false;
  lastUpdate = new Date();
  
  // Configs
  tabs = [
    { id: 'ping', label: 'Ping', icon: 'icon-ping' },
    { id: 'health', label: 'Health Check', icon: 'icon-health' },
    { id: 'logs', label: 'Logs', icon: 'icon-logs' },
    { id: 'system', label: 'Sistema', icon: 'icon-system' }
  ];
  
  logFilters = {
    level: '',
    service: '',
    limit: 100
  };

  constructor(private monitoringService: MonitoringService) {}

  ngOnInit() {
    this.initializeMonitoring();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMonitoring() {
    // Subscribe to real-time data
    this.monitoringService.pingStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status) {
          this.pingStatus = status;
          this.lastUpdate = new Date();
        }
      });

    this.monitoringService.healthCheck$
      .pipe(takeUntil(this.destroy$))
      .subscribe(health => {
        if (health) {
          this.healthCheck = health;
        }
      });

    // Initial load
    this.forceRefresh();
  }

  private setupAutoRefresh() {
    // Auto-refresh system info every 5 minutes
    timer(0, 300000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.activeTab === 'system') {
        this.loadSystemInfo();
      }
    });
  }

  switchTab(tabId: string) {
    this.activeTab = tabId;
    
    // Load data specific to tab
    switch (tabId) {
      case 'logs':
        this.loadLogs();
        break;
      case 'system':
        this.loadSystemInfo();
        this.loadMetrics();
        break;
    }
  }

  forceRefresh() {
    this.refreshing = true;
    this.monitoringService.forceRefresh();
    
    // Stop refreshing indicator after 2 seconds
    setTimeout(() => {
      this.refreshing = false;
    }, 2000);
  }

  loadLogs() {
    this.monitoringService.getLogs(this.logFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.logsData = data;
        },
        error: (error) => {
          console.error('Erro ao carregar logs:', error);
        }
      });
  }

  loadSystemInfo() {
    this.monitoringService.getSystemInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.systemInfo = data;
        },
        error: (error) => {
          console.error('Erro ao carregar informações do sistema:', error);
        }
      });
  }

  loadMetrics() {
    this.monitoringService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.metrics = data;
        },
        error: (error) => {
          console.error('Erro ao carregar métricas:', error);
        }
      });
  }

  // Utility methods for ping status
  getOverallPingStatus(): string {
    if (!this.pingStatus) return 'unknown';
    
    const services = [
      this.pingStatus.backend, 
      this.pingStatus.redis, 
      this.pingStatus.database
    ];
    const onlineCount = services.filter(s => s?.status === 'pong').length;
    
    if (onlineCount === 3) return 'healthy';
    if (onlineCount > 0) return 'degraded';
    return 'unhealthy';
  }

  getOverallPingStatusText(): string {
    const status = this.getOverallPingStatus();
    switch (status) {
      case 'healthy': return 'Todos os Serviços Online';
      case 'degraded': return 'Alguns Serviços Offline';
      case 'unhealthy': return 'Todos os Serviços Offline';
      default: return 'Status Desconhecido';
    }
  }

  getOnlineServicesCount(): number {
    if (!this.pingStatus) return 0;
    const services = [
      this.pingStatus.backend, 
      this.pingStatus.redis, 
      this.pingStatus.database
    ];
    return services.filter(s => s?.status === 'pong').length;
  }

  getAverageResponseTime(): number {
    if (!this.pingStatus) return 0;
    const services = [
      this.pingStatus.backend, 
      this.pingStatus.redis, 
      this.pingStatus.database
    ];
    const totalTime = services.reduce((sum, s) => sum + (s?.responseTime || 0), 0);
    return Math.round(totalTime / services.length);
  }

  // Utility methods for health check
  getHealthIcon(): string {
    if (!this.healthCheck) return 'icon-unknown';
    
    switch (this.healthCheck.status) {
      case 'healthy': return 'icon-check-circle';
      case 'degraded': return 'icon-alert-triangle';
      case 'unhealthy': return 'icon-x-circle';
      default: return 'icon-help-circle';
    }
  }

  getHealthStatusText(): string {
    if (!this.healthCheck) return 'Verificando...';
    
    switch (this.healthCheck.status) {
      case 'healthy': return 'Sistema Saudável';
      case 'degraded': return 'Sistema Degradado';
      case 'unhealthy': return 'Sistema com Problemas';
      default: return 'Status Desconhecido';
    }
  }

  getHealthStatusDescription(): string {
    if (!this.healthCheck) return '';
    
    switch (this.healthCheck.status) {
      case 'healthy': return 'Todos os serviços estão funcionando normalmente.';
      case 'degraded': return 'Alguns serviços podem estar indisponíveis.';
      case 'unhealthy': return 'Problemas críticos detectados no sistema.';
      default: return '';
    }
  }

  // Utility methods
  formatUptime(seconds: number): string {
    if (!seconds) return '0s';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
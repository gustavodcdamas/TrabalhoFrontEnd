// admin-dashboard.component.ts
import { Component, OnInit, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp, faUniregistry, faGgCircle } from '@fortawesome/free-brands-svg-icons';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { 
  faUserCircle, faUser, faTag, faUsers, faPalette, faLightbulb, faLock, 
  faChartColumn, faChartDiagram, faPlaneArrival, faBuildingColumns, faBuilding, 
  faStore, faXmark, faUserEdit, faSignOutAlt, 
  // ✅ NOVOS ÍCONES PARA MONITORAMENTO
  faHeartbeat, faWifi, faFileLines, faHeartPulse, faServer
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRole } from '../../../models/user.model';
import { Subject, takeUntil } from 'rxjs';
import { MonitoringService } from 'src/app/services/monitoramento/monitoramento.service';

library.add(faUserCircle);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, FontAwesomeModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  userName: string = 'Nome';
  activeTab: 'all' | 'income' | 'expense' = 'all';
  currentPage: number = 1;
  totalPages: number = 4;
  userPhoto = '/assets/default-user.png';
  isDropdownOpen = false;
  isMenuOpen = false;

  // ✅ PROPRIEDADES PARA MONITORAMENTO
  systemStatus: string = 'checking';
  systemStatusText: string = 'Verificando...';
  currentTab: string = '';

  constructor(
    private router: Router, 
    private cdr: ChangeDetectorRef, 
    public authService: AuthService, 
    library: FaIconLibrary,
    // ✅ INJETAR SERVIÇO DE MONITORAMENTO
    private monitoringService: MonitoringService,
    private activatedRoute: ActivatedRoute
  ) { 
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular, faWhatsapp, faCircleUser, faTag, faUsers,
      faPalette, faLock, faLightbulb, faChartColumn, faChartDiagram, faPlaneArrival, faBuildingColumns, 
      faBuilding, faStore, faXmark, faUser, faCircleUser, faUserEdit, faSignOutAlt,
      // ✅ ADICIONAR NOVOS ÍCONES
      faHeartbeat, faWifi, faFileLines, faHeartPulse, faServer
    );
  }

  readonly UserRole = UserRole;

  ngOnInit(): void {
    // Só carrega os dados se estiver na página principal do dashboard
    if (this.router.url === '/admin' || this.router.url === '/admin/dashboard') {
      // Dados do dashboard
    }

    // ✅ INICIALIZAR MONITORAMENTO APENAS PARA ADMINS
    if (this.authService.hasRole(UserRole.ADMIN) || this.authService.hasRole(UserRole.SUPER_ADMIN)) {
      this.initializeMonitoring();
    }

    // ✅ MONITORAR MUDANÇAS DE QUERY PARAMS
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentTab = params['tab'] || '';
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ INICIALIZAR SISTEMA DE MONITORAMENTO
  private initializeMonitoring(): void {
    // Monitorar status do sistema em tempo real
    this.monitoringService.pingStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pingStatus => {
        if (pingStatus) {
          this.updateSystemStatus(pingStatus);
        }
      });

    // Fazer verificação inicial
    this.checkSystemStatus();
  }

  // ✅ ATUALIZAR STATUS DO SISTEMA
  private updateSystemStatus(pingStatus: any): void {
    const services = [pingStatus.backend, pingStatus.redis, pingStatus.database];
    const onlineCount = services.filter(s => s.status === 'pong').length;
    
    if (onlineCount === 3) {
      this.systemStatus = 'healthy';
      this.systemStatusText = 'OK';
    } else if (onlineCount > 0) {
      this.systemStatus = 'degraded';
      this.systemStatusText = 'DEGRADADO';
    } else {
      this.systemStatus = 'unhealthy';
      this.systemStatusText = 'ERRO';
    }
    
    this.cdr.detectChanges();
  }

  // ✅ VERIFICAR STATUS DO SISTEMA
  private checkSystemStatus(): void {
    this.systemStatus = 'checking';
    this.systemStatusText = 'VERIFICANDO';
    this.cdr.detectChanges();

    this.monitoringService.getPingStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pingStatus) => {
          this.updateSystemStatus(pingStatus);
        },
        error: () => {
          this.systemStatus = 'unhealthy';
          this.systemStatusText = 'ERRO';
          this.cdr.detectChanges();
        }
      });
  }

  // ✅ OBTER TEXTO DO STATUS DO SISTEMA
  getSystemStatusText(): string {
    return this.systemStatusText;
  }

  // ✅ OBTER TAB ATUAL
  getCurrentTab(): string {
    return this.currentTab;
  }

  toggleMenu(): void {
    console.log('Toggle menu called, current state:', this.isMenuOpen);
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      document.body.classList.add('no-scroll');
      console.log('Menu opened');
    } else {
      document.body.classList.remove('no-scroll');
      console.log('Menu closed');
    }
    
    // Força a detecção de mudanças
    this.cdr.detectChanges();
  }

  closeMenu(): void {
    console.log('Close menu called');
    this.isMenuOpen = false;
    document.body.classList.remove('no-scroll');
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const window = event.target as Window;
    
    // Se a tela ficar grande, fecha o menu mobile
    if (window.innerWidth > 992 && this.isMenuOpen) {
      console.log('Closing menu due to desktop resize');
      this.closeMenu();
    }
  }

  // Método para debug - remova depois que estiver funcionando
  debugMenuState(): void {
    console.log('Menu state debug:', {
      isMenuOpen: this.isMenuOpen,
      bodyClasses: document.body.classList.toString(),
      sidebarElement: document.querySelector('.sidebar'),
      overlayElement: document.querySelector('.sidebar-overlay')
    });
  }

  preventRedirect(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    console.log('Dropdown clicked - event prevented');
  }

  editProfile() {
    this.router.navigate(['/admin/update-profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Método melhorado para verificar a rota ativa
  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // Método para navegação programática
  navigateTo(route: string): void {
    console.log('Navigating to:', route);
    this.router.navigateByUrl(route).then(() => {
      console.log('Navigation complete to:', route);
      // Força a detecção de mudanças para atualizar a UI
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }

  setActiveTab(tab: 'all' | 'income' | 'expense'): void {
    this.activeTab = tab;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Método auxiliar para calcular a altura da barra no gráfico
  getBarHeight(amount: number): string {
    const maxAmount = 12500; // Valor máximo do gráfico
    const percentage = (amount / maxAmount) * 100;
    return `${percentage}%`;
  }
}
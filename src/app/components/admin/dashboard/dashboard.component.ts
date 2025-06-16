// admin-dashboard.component.ts
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { faTag, faUsers, faPalette, faLightbulb, faChartColumn, faChartDiagram, faPlaneArrival, faBuildingColumns, faBuilding, faStore, faXmark, faUser } from '@fortawesome/free-solid-svg-icons';
import { Chart, registerables } from 'chart.js';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { AdministratorService } from 'src/app/services/admin/administrator.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ClientesService } from 'src/app/services/cliente/cliente.service';
import { CriativosService } from 'src/app/services/criativo/criativo.service';
import { IdvService } from 'src/app/services/idv/idv.service';
import { institucionalService } from 'src/app/services/institucional/institucional.service';
import { landingService } from 'src/app/services/landing-page/landing-page.service';
import { servicosService } from 'src/app/services/servico/servico.service';
import { UserService } from 'src/app/services/user/user.service';

// Interfaces para tipagem
interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  totalClients: number;
  totalServices: number;
  totalIdv: number;
  totalCreatives: number;
  totalInstitutional: number;
  totalLandings: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.Default // Mudando para Default temporariamente
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Injeção de dependências
  private adminService = inject(AdministratorService);
  private clientService = inject(ClientesService);
  private criativosService = inject(CriativosService);
  private idvService = inject(IdvService);
  private institucionalService = inject(institucionalService);
  private landingService = inject(landingService);
  private servicosService = inject(servicosService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  // Propriedades do usuário
  userName: string = 'User';
  currentUser: any = null;

  // Propriedades do dashboard
  stats: DashboardStats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalClients: 0,
    totalServices: 0,
    totalIdv: 0,
    totalCreatives: 0,
    totalInstitutional: 0,
    totalLandings: 0
  };

  loading = true;
  error: string | null = null;

  // Charts
  usersPieChart: Chart | null = null;
  servicesBarChart: Chart | null = null;
  monthlyChart: Chart | null = null;

  constructor(library: FaIconLibrary) { 
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular, faWhatsapp, 
      faCircleUser, faTag, faUsers, faPalette, faLightbulb, 
      faChartColumn, faChartDiagram, faPlaneArrival, faBuildingColumns, 
      faBuilding, faStore, faXmark, faUser, faCircleUser
    );

    // Registrar Chart.js
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private loadUserData(): void {
    // Primeiro, pegar o usuário atual do AuthService
    this.currentUser = this.authService.currentUserValue;
    
    if (this.currentUser?.id) {
      console.log('👤 Usuário atual encontrado:', this.currentUser);
      
      // Buscar dados completos do usuário
      this.userService.getUserById(this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            if (user) {
              console.log('✅ Dados completos do usuário:', user);
              this.userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || user.email || 'User';
              this.cdr.detectChanges();
            } else {
              // Fallback: usar dados do currentUser
              this.userName = this.currentUser.firstName ? 
                `${this.currentUser.firstName} ${this.currentUser.lastName || ''}`.trim() : 
                this.currentUser.username || this.currentUser.email || 'User';
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.warn('⚠️ Erro ao buscar dados do usuário, usando fallback:', err);
            // Fallback: usar dados do currentUser ou email
            this.userName = this.currentUser.firstName ? 
              `${this.currentUser.firstName} ${this.currentUser.lastName || ''}`.trim() : 
              this.currentUser.username || this.currentUser.email?.split('@')[0] || 'User';
            this.cdr.detectChanges();
          }
        });
    } else {
      // Se não há usuário logado, usar valor padrão
      console.warn('⚠️ Nenhum usuário logado encontrado');
      this.userName = 'User';
      this.cdr.detectChanges();
    }
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Carregar dados de todos os serviços em paralelo
    forkJoin({
      administrators: this.adminService.loadAdministrators().pipe(
        catchError(err => {
          console.warn('Erro ao carregar administradores:', err);
          return of([]);
        })
      ),
      clients: this.clientService.loadClientes().pipe(
        catchError(err => {
          console.warn('Erro ao carregar clientes:', err);
          return of([]);
        })
      ),
      criativos: this.criativosService.getAll().pipe(
        catchError(err => {
          console.warn('Erro ao carregar criativos:', err);
          return of([]);
        })
      ),
      idv: this.idvService.getAll().pipe(
        catchError(err => {
          console.warn('Erro ao carregar IDVs:', err);
          return of([]);
        })
      ),
      institucional: this.institucionalService.getAll().pipe(
        catchError(err => {
          console.warn('Erro ao carregar institucionais:', err);
          return of([]);
        })
      ),
      landing: this.landingService.getAll().pipe(
        catchError(err => {
          console.warn('Erro ao carregar landing pages:', err);
          return of([]);
        })
      ),
      servicos: this.servicosService.getAll().pipe(
        catchError(err => {
          console.warn('Erro ao carregar serviços:', err);
          return of([]);
        })
      )
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.processData(data);
        this.createCharts();
      },
      error: (err) => {
        console.error('Erro geral ao carregar dados:', err);
        this.error = 'Erro ao carregar dados do dashboard';
        this.loadFallbackData();
      }
    });
  }

  private processData(data: any): void {
    // Processar administradores
    const superAdmins = data.administrators.filter((admin: any) => admin.role === 'super_admin').length;
    const regularAdmins = data.administrators.filter((admin: any) => admin.role === 'admin').length;

    this.stats = {
      totalUsers: data.administrators.length + data.clients.length,
      totalAdmins: regularAdmins,
      totalSuperAdmins: superAdmins,
      totalClients: data.clients.length,
      totalServices: data.servicos.length,
      totalIdv: data.idv.length,
      totalCreatives: data.criativos.length,
      totalInstitutional: data.institucional.length,
      totalLandings: data.landing.length
    };

    console.log('📊 Stats processadas:', this.stats);
    
    // Forçar detecção de mudanças após processar os dados
    this.cdr.detectChanges();
  }

  private loadFallbackData(): void {
    // Dados de fallback para demonstração
    this.stats = {
      totalUsers: 15,
      totalAdmins: 3,
      totalSuperAdmins: 1,
      totalClients: 11,
      totalServices: 25,
      totalIdv: 8,
      totalCreatives: 12,
      totalInstitutional: 5,
      totalLandings: 7
    };
    
    console.log('📊 Usando dados de fallback:', this.stats);
    
    // Forçar detecção de mudanças
    this.cdr.detectChanges();
    this.createCharts();
  }

  private createCharts(): void {
    setTimeout(() => {
      this.createUsersPieChart();
      this.createServicesBarChart();
      this.createMonthlyChart();
    }, 100);
  }

  private createUsersPieChart(): void {
    const canvas = document.getElementById('usersPieChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.destroyChart(this.usersPieChart);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.usersPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Super Admins', 'Administradores', 'Clientes'],
        datasets: [{
          data: [this.stats.totalSuperAdmins, this.stats.totalAdmins, this.stats.totalClients],
          backgroundColor: [
            '#FF6384',
            '#36A2EB', 
            '#FFCE56'
          ],
          borderColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Distribuição de Usuários',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
  }

  private createServicesBarChart(): void {
    const canvas = document.getElementById('servicesBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.destroyChart(this.servicesBarChart);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.servicesBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Serviços', 'IDV', 'Criativos', 'Institucional', 'Landing Pages'],
        datasets: [{
          label: 'Quantidade',
          data: [
            this.stats.totalServices,
            this.stats.totalIdv,
            this.stats.totalCreatives,
            this.stats.totalInstitutional,
            this.stats.totalLandings
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Serviços por Categoria',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  private createMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.destroyChart(this.monthlyChart);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dados simulados para gráfico mensal
    const monthlyData = this.generateMonthlyData();

    this.monthlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Novos Clientes',
            data: monthlyData.clients,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4
          },
          {
            label: 'Novos Serviços',
            data: monthlyData.services,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Crescimento Mensal',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private generateMonthlyData(): { clients: number[], services: number[] } {
    return {
      clients: [2, 4, 3, 5, 7, 6],
      services: [3, 2, 5, 4, 6, 8]
    };
  }

  private destroyChart(chart: Chart | null): void {
    if (chart) {
      chart.destroy();
    }
  }

  private destroyCharts(): void {
    this.destroyChart(this.usersPieChart);
    this.destroyChart(this.servicesBarChart);
    this.destroyChart(this.monthlyChart);
  }

  // Métodos auxiliares para o template
  getTotalProjects(): number {
    return this.stats.totalIdv + this.stats.totalCreatives + 
           this.stats.totalInstitutional + this.stats.totalLandings;
  }

  getCompletionRate(): number {
    const total = this.getTotalProjects();
    return total > 0 ? Math.round((total * 0.85)) : 0; // 85% de taxa de conclusão simulada
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
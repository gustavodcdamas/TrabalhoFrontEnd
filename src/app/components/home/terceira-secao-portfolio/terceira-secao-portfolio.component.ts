import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { SwiperModule } from 'swiper/angular';
import { forkJoin } from 'rxjs';

import { SwiperCustomModule } from '../../shared/carousel/swiper.module';
import { CriativosService } from '../../../services/criativo/criativo.service';
import { IdvService } from '../../../services/idv/idv.service';
import { landingService } from '../../../services/landing-page/landing-page.service';
import { institucionalService } from '../../../services/institucional/institucional.service';
import { criativos } from '../../../models/criativos.model';
import { idv } from '../../../models/idv.model';
import { landing } from '../../../models/landing.model';
import { institucional } from '../../../models/institucional.model';
import { environment } from '../../../../environments/environment';

// Interface unificada para portfolio
interface PortfolioItem {
  id: string;
  titulo: string;
  descricao?: string | null;
  imagem: string;
  categoria: string;
  originalData: any; // Para manter dados originais
}

@Component({
  selector: 'app-terceira-secao-portfolio',
  templateUrl: './terceira-secao-portfolio.component.html',
  imports: [CommonModule, SwiperCustomModule, SwiperModule],
  styleUrls: ['./terceira-secao-portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TerceiraSecaoPortfolioComponent implements OnInit {
  // Injetar todos os serviços
  private criativosService = inject(CriativosService);
  private idvService = inject(IdvService);
  private landingService = inject(landingService);
  private institucionalService = inject(institucionalService);
  
  // Signals para gerenciar estado
  portfolioItems = signal<PortfolioItem[]>([]);
  creativosItems = signal<PortfolioItem[]>([]);
  identidadesItems = signal<PortfolioItem[]>([]);
  landingPagesItems = signal<PortfolioItem[]>([]);
  sitesInstitucionaisItems = signal<PortfolioItem[]>([]);
  
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAllPortfolioData();
  }

  private loadAllPortfolioData(): void {
    console.log('🔄 Portfolio - Carregando todos os dados do portfólio...');
    this.isLoading.set(true);
    this.error.set(null);

    // Carrega dados de todos os serviços em paralelo
    forkJoin({
      criativos: this.criativosService.getAll(),
      identidades: this.idvService.getAll(),
      landingPages: this.landingService.getAll(),
      institucionais: this.institucionalService.getAll()
    }).subscribe({
      next: (response) => {
        console.log('✅ Portfolio - Todos os dados recebidos:', response);
        
        // Converte todos os dados para o formato unificado
        const allItems: PortfolioItem[] = [
          ...this.convertCriativos(response.criativos || []),
          ...this.convertIdentidades(response.identidades || []),
          ...this.convertLandingPages(response.landingPages || []),
          ...this.convertInstitucionais(response.institucionais || [])
        ];

        this.portfolioItems.set(allItems);
        this.separateItemsByCategory(allItems);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Portfolio - Erro ao carregar portfolio:', err);
        this.error.set('Erro ao conectar com a API');
        this.isLoading.set(false);
      }
    });
  }

  // Conversores para formato unificado
  private convertCriativos(items: criativos[]): PortfolioItem[] {
    return items.filter(item => item && item.id).map(item => ({
      id: item.id?.toString() || Math.random().toString(),
      titulo: item.titulo || item.cliente || 'Projeto Criativo',
      descricao: item.descricao || null,
      imagem: item.image || '',
      categoria: 'criativos',
      originalData: item
    }));
  }

  private convertIdentidades(items: idv[]): PortfolioItem[] {
    return items.filter(item => item && item.id).map(item => ({
      id: item.id?.toString() || Math.random().toString(),
      titulo: item.titulo || item.cliente || 'Identidade Visual',
      descricao: item.descricao || null,
      imagem: item.image || '',
      categoria: 'identidades-visuais',
      originalData: item
    }));
  }

  private convertLandingPages(items: landing[]): PortfolioItem[] {
    return items.filter(item => item && item.id).map(item => ({
      id: item.id?.toString() || Math.random().toString(),
      titulo: item.titulo || item.cliente || 'Landing Page',
      descricao: item.descricao || null,
      imagem: item.image || '',
      categoria: 'landing-pages',
      originalData: item
    }));
  }

  private convertInstitucionais(items: institucional[]): PortfolioItem[] {
    return items.filter(item => item && item.id).map(item => ({
      id: item.id?.toString() || Math.random().toString(),
      titulo: item.titulo || item.cliente || 'Site Institucional',
      descricao: item.descricao || null,
      imagem: item.image || '',
      categoria: 'sites-institucionais',
      originalData: item
    }));
  }

  private separateItemsByCategory(allItems: PortfolioItem[]): void {
    console.log('🔍 Portfolio - Separando itens por categoria:', allItems.length);
    
    this.creativosItems.set(
      allItems.filter(item => item.categoria === 'criativos' && item.imagem)
    );
    
    this.identidadesItems.set(
      allItems.filter(item => item.categoria === 'identidades-visuais' && item.imagem)
    );
    
    this.landingPagesItems.set(
      allItems.filter(item => item.categoria === 'landing-pages' && item.imagem)
    );
    
    this.sitesInstitucionaisItems.set(
      allItems.filter(item => item.categoria === 'sites-institucionais' && item.imagem)
    );

    console.log('📊 Portfolio - Itens por categoria:', {
      criativos: this.creativosItems().length,
      identidades: this.identidadesItems().length,
      landingPages: this.landingPagesItems().length,
      sitesInstitucionais: this.sitesInstitucionaisItems().length
    });
  }

  // Método para construir URL completa da imagem
  getImageUrl(item: PortfolioItem | null | undefined): string {
    if (!item || !item.imagem) {
      return 'assets/images/placeholder.png';
    }
    
    // Se a imagem já tem URL completa, retorna como está
    if (item.imagem.startsWith('http')) {
      return item.imagem;
    }
    
    // Caso contrário, constrói a URL completa usando seu environment
    return `${environment.apiUrl}/uploads/${item.imagem}`;
  }

  getSlidesPerView(): number {
    // Verifica se está em ambiente de navegador
    if (typeof window === 'undefined') {
      return 1; // Fallback para SSR
    }
    
    const width = window.innerWidth;
    if (width >= 1200) return 5;
    if (width >= 992) return 3;
    if (width >= 768) return 2;
    return 1;
  }

  // Método para recarregar dados
  reloadData(): void {
    this.loadAllPortfolioData();
  }

  // TrackBy function para performance
  trackByItem(index: number, item: PortfolioItem): string {
    return item?.id || index.toString();
  }

  // Método para lidar com erro de carregamento de imagem
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder.png';
    }
  }

  // Método para obter estatísticas (opcional)
  getPortfolioStats() {
    return {
      total: this.portfolioItems().length,
      criativos: this.creativosItems().length,
      identidades: this.identidadesItems().length,
      landingPages: this.landingPagesItems().length,
      institucionais: this.sitesInstitucionaisItems().length
    };
  }
}
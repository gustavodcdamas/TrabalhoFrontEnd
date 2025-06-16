import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardServicoComponent } from '../../shared/card-servico/card-servico.component';
import { SwiperCustomModule } from '../../shared/carousel/swiper.module';
import { SwiperModule } from 'swiper/angular';
import { environment } from '../../../../environments/environment';
import SwiperCore, { Navigation, Pagination } from 'swiper';
import { servicosService } from '../../../services/servico/servico.service';
import { servicos } from '../../../models/servicos.model';

SwiperCore.use([Navigation, Pagination]);

@Component({
  selector: 'app-segunda-secao-servicos',
  standalone: true,
  imports: [CardServicoComponent, SwiperCustomModule, SwiperModule, CommonModule],
  templateUrl: './segunda-secao-servicos.component.html',
  styleUrl: './segunda-secao-servicos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegundaSecaoServicosComponent implements OnInit {
  private servicosService = inject(servicosService);
  
  // Signals para gerenciar estado
  services = signal<servicos[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Fallback para dados estáticos caso a API não funcione
  private fallbackServices = [
    { icon: 'Criativos.svg', title: 'Criativos' },
    { icon: 'Sites.svg', title: 'Sites e Landing Page' },
    { icon: 'identidade.svg', title: 'Identidade Visual' },
    { icon: 'social.svg', title: 'Gestão de Social Media' },
    { icon: 'menbros.svg', title: 'Área de Membros' },
    { icon: 'lancamentos.svg', title: 'Lançamentos' },
    { icon: 'Thumbnails.svg', title: 'Thumbnails' }
  ];

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    console.log('🔄 Serviços - Carregando dados dos serviços...');
    this.isLoading.set(true);
    this.error.set(null);

    this.servicosService.getAll().subscribe({
      next: (response) => {
        console.log('✅ Serviços - Dados recebidos:', response);
        console.log('📊 Quantidade de serviços:', response?.length || 0);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Log detalhado de cada serviço
          response.forEach((service, index) => {
            console.log(`📋 Serviço ${index + 1}:`, {
              id: service?.id,
              titulo: service?.titulo,
              image: service?.image,
              icon: service?.icon,
              status: service?.status
            });
          });
          
          // Filtra apenas itens válidos e ativos
          const validServices = response.filter(service => {
            const isValid = service && service.id && service.status === 'ativo';
            if (!isValid) {
              console.log('❌ Serviço inválido ou inativo:', service);
            }
            return isValid;
          });
          
          console.log('✅ Serviços válidos filtrados:', validServices.length);
          
          if (validServices.length > 0) {
            this.services.set(validServices);
          } else {
            // Se não há serviços ativos, usa fallback
            console.log('⚠️ Serviços - Nenhum serviço ativo da API, usando fallback');
            this.services.set(this.convertFallbackData());
          }
        } else {
          // Se não há dados da API, usa os dados estáticos
          console.log('⚠️ Serviços - Nenhum dado da API, usando fallback');
          this.services.set(this.convertFallbackData());
        }
        
        this.isLoading.set(false);
        
        // Log final do que foi setado
        console.log('🎯 Serviços finais setados:', this.services());
      },
      error: (err) => {
        console.error('❌ Serviços - Erro ao carregar serviços:', err);
        console.log('🔄 Serviços - Usando dados estáticos como fallback');
        
        // Em caso de erro, usa os dados estáticos
        this.services.set(this.convertFallbackData());
        this.error.set(null); // Não mostra erro ao usuário, apenas usa fallback
        this.isLoading.set(false);
      }
    });
  }

  // Converte dados estáticos para o formato do modelo correto
  private convertFallbackData(): servicos[] {
    return this.fallbackServices.filter(service => service && service.title).map((service, index) => ({
      id: (index + 1).toString(),
      titulo: service.title || 'Serviço',
      cliente: service.title || 'Cliente',
      descricao: `Serviço de ${service.title || 'Desconhecido'}`,
      image: service.icon || '',
      icon: service.icon, // Campo opcional
      dataCriacao: new Date(), // Objeto Date, não string
      dataAtualizacao: new Date(), // Objeto Date, não string
      status: 'ativo' as const // Tipo literal específico
    }));
  }

  // Método para construir URL da imagem/ícone
  getServiceIcon(service: servicos | null | undefined): string {
    console.log('🖼️ getServiceIcon chamado para:', service);
    
    // Verifica se service existe
    if (!service) {
      console.log('⚠️ Service é null/undefined, usando fallback');
      return 'assets/icons/service-default.svg';
    }
    
    // Prioriza o campo 'icon' se existir, senão usa 'image'
    const iconPath = service.icon || service.image;
    console.log('🔍 Icon path encontrado:', iconPath);
    
    if (!iconPath) {
      console.log('⚠️ Nenhum icon/image encontrado, usando fallback');
      return 'assets/icons/service-default.svg';
    }
    
    const finalUrl = this.buildImageUrl(iconPath);
    console.log('🌐 URL final gerada:', finalUrl);
    return finalUrl;
  }

  // Método para construir URL completa da imagem
  private buildImageUrl(imagePath: string | null | undefined): string {
    console.log('🔧 buildImageUrl chamado com:', imagePath);
    
    if (!imagePath) {
      console.log('⚠️ ImagePath vazio, retornando fallback');
      return 'assets/icons/service-default.svg';
    }
    
    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http')) {
      console.log('🌐 URL completa detectada:', imagePath);
      return imagePath;
    }
    
    // Se é um arquivo local (como os originais), mantém o caminho
    if (imagePath.endsWith('.svg') && !imagePath.includes('/')) {
      const localPath = `assets/icons/${imagePath}`;
      console.log('📁 Arquivo local detectado:', localPath);
      return localPath;
    }
    
    // Caso contrário, constrói URL da API
    const apiUrl = `${environment.apiUrl}/uploads/${imagePath}`;
    console.log('🚀 URL da API construída:', apiUrl);
    console.log('🔗 Environment API URL:', environment.apiUrl);
    return apiUrl;
  }

  // Método para pegar o título do serviço
  getServiceTitle(service: servicos | null | undefined): string {
    if (!service) {
      return 'Serviço';
    }
    return service.titulo || service.cliente || 'Serviço';
  }

  // Método para pegar a descrição do serviço (opcional)
  getServiceDescription(service: servicos | null | undefined): string | undefined {
    if (!service) {
      return undefined;
    }
    return service.descricao;
  }

  // Método para verificar se o serviço está ativo
  isServiceActive(service: servicos): boolean {
    return service.status === 'ativo';
  }

  // Método para formatar data (opcional, para debug)
  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }

  // Método para lidar com erro de carregamento de imagem
  handleImageError(event: any, service: servicos): void {
    console.error('❌ Erro ao carregar imagem para serviço:', service?.titulo);
    console.error('🔗 URL que falhou:', event.target.src);
    console.error('📋 Dados do serviço:', service);
    
    // Define imagem de fallback
    event.target.src = 'assets/icons/service-default.svg';
  }

  // Método para lidar com sucesso de carregamento de imagem
  handleImageLoad(event: any, service: servicos): void {
    console.log('✅ Imagem carregada com sucesso para:', service?.titulo);
    console.log('🔗 URL carregada:', event.target.src);
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
    this.loadServices();
  }

  // TrackBy function para performance
  trackByService(index: number, service: servicos): number | string {
    return service?.id || index.toString();
  }
}
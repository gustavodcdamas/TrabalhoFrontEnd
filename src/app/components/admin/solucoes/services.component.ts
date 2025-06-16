// services.component.ts
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface Recurso {
  texto: string;
  incluido: boolean;
}

interface Service {
  id: number;
  titulo: string;
  subtitulo: string;
  preco: number;
  periodo: string;
  categoria: 'design' | 'marketing' | 'web' | 'combo';
  recursos: Recurso[];
  destaque: boolean;
  ativo: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  searchTerm: string = '';
  currentFilter: 'all' | 'design' | 'marketing' | 'web' | 'combo' = 'all';

  // Modal e Formulário
  showNovoServiceModal: boolean = false;
  serviceForm: FormGroup;
  isEditMode: boolean = false;
  currentServiceId: number | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private formBuilder: FormBuilder) {
    this.serviceForm = this.createServiceForm();
  }

  ngOnInit(): void {
    // Simular dados de planos de serviço
    this.services = [
      {
        id: 1,
        titulo: 'Plano Básico Design',
        subtitulo: 'Ideal para microempresas',
        preco: 299,
        periodo: 'mês',
        categoria: 'design',
        destaque: false,
        ativo: true,
        recursos: [
          { texto: 'Criação de Logo', incluido: true },
          { texto: 'Identidade Visual Básica', incluido: true },
          { texto: 'Papelaria Básica', incluido: true },
          { texto: 'Manual de Marca', incluido: false },
          { texto: 'Design de Redes Sociais', incluido: false }
        ]
      },
      {
        id: 2,
        titulo: 'Plano Pro Design',
        subtitulo: 'Para pequenas e médias empresas',
        preco: 599,
        periodo: 'mês',
        categoria: 'design',
        destaque: true,
        ativo: true,
        recursos: [
          { texto: 'Criação de Logo', incluido: true },
          { texto: 'Identidade Visual Completa', incluido: true },
          { texto: 'Papelaria Completa', incluido: true },
          { texto: 'Manual de Marca', incluido: true },
          { texto: 'Design de Redes Sociais (5 posts semanais)', incluido: true },
          { texto: 'Design de Email Marketing', incluido: false }
        ]
      },
      {
        id: 3,
        titulo: 'Plano Básico Marketing',
        subtitulo: 'Para iniciantes em marketing digital',
        preco: 399,
        periodo: 'mês',
        categoria: 'marketing',
        destaque: false,
        ativo: true,
        recursos: [
          { texto: 'Gestão de 2 Redes Sociais', incluido: true },
          { texto: '10 Posts Mensais', incluido: true },
          { texto: 'Relatório Mensal', incluido: true },
          { texto: 'Campanha de Anúncios', incluido: false },
          { texto: 'Email Marketing', incluido: false }
        ]
      },
      {
        id: 4,
        titulo: 'Plano Avançado Marketing',
        subtitulo: 'Marketing completo para empresas',
        preco: 899,
        periodo: 'mês',
        categoria: 'marketing',
        destaque: true,
        ativo: true,
        recursos: [
          { texto: 'Gestão de 4 Redes Sociais', incluido: true },
          { texto: '20 Posts Mensais', incluido: true },
          { texto: 'Relatórios Semanais', incluido: true },
          { texto: 'Campanhas de Anúncios (Facebook e Google)', incluido: true },
          { texto: 'Email Marketing (2 disparos mensais)', incluido: true },
          { texto: 'Estratégia de Conteúdo', incluido: true }
        ]
      },
      {
        id: 5,
        titulo: 'Website Básico',
        subtitulo: 'Presença online essencial',
        preco: 1299,
        periodo: 'projeto',
        categoria: 'web',
        destaque: false,
        ativo: true,
        recursos: [
          { texto: 'Site One Page', incluido: true },
          { texto: 'Design Responsivo', incluido: true },
          { texto: 'Formulário de Contato', incluido: true },
          { texto: 'Otimização SEO Básica', incluido: true },
          { texto: 'Integração Redes Sociais', incluido: true },
          { texto: 'Blog', incluido: false },
          { texto: 'E-commerce', incluido: false }
        ]
      },
      {
        id: 6,
        titulo: 'Website Profissional',
        subtitulo: 'Site completo para empresas',
        preco: 2499,
        periodo: 'projeto',
        categoria: 'web',
        destaque: true,
        ativo: true,
        recursos: [
          { texto: 'Site Multi-páginas (até 10 páginas)', incluido: true },
          { texto: 'Design Personalizado Responsivo', incluido: true },
          { texto: 'Formulários Avançados', incluido: true },
          { texto: 'Otimização SEO Completa', incluido: true },
          { texto: 'Blog Integrado', incluido: true },
          { texto: 'Painel Administrativo', incluido: true },
          { texto: 'E-commerce', incluido: false }
        ]
      },
      {
        id: 7,
        titulo: 'E-commerce Completo',
        subtitulo: 'Loja virtual profissional',
        preco: 3999,
        periodo: 'projeto',
        categoria: 'web',
        destaque: false,
        ativo: true,
        recursos: [
          { texto: 'Loja Virtual Completa', incluido: true },
          { texto: 'Até 100 Produtos', incluido: true },
          { texto: 'Painel Administrativo', incluido: true },
          { texto: 'Integração com Meios de Pagamento', incluido: true },
          { texto: 'Integração com Shipping', incluido: true },
          { texto: 'Relatórios de Vendas', incluido: true },
          { texto: 'Otimização SEO para E-commerce', incluido: true }
        ]
      },
      {
        id: 8,
        titulo: 'Pacote Startup',
        subtitulo: 'Tudo que uma startup precisa',
        preco: 1999,
        periodo: 'mês',
        categoria: 'combo',
        destaque: true,
        ativo: true,
        recursos: [
          { texto: 'Identidade Visual Completa', incluido: true },
          { texto: 'Website Profissional', incluido: true },
          { texto: 'Gestão de 3 Redes Sociais', incluido: true },
          { texto: '15 Posts Mensais', incluido: true },
          { texto: 'Campanhas de Anúncios', incluido: true },
          { texto: 'Email Marketing', incluido: true },
          { texto: 'Relatórios Mensais', incluido: true }
        ]
      },
      {
        id: 9,
        titulo: 'Pacote Enterprise',
        subtitulo: 'Solução completa para grandes empresas',
        preco: 3999,
        periodo: 'mês',
        categoria: 'combo',
        destaque: false,
        ativo: false,
        recursos: [
          { texto: 'Revisão de Marca', incluido: true },
          { texto: 'Website Corporativo', incluido: true },
          { texto: 'Gestão de 5 Redes Sociais', incluido: true },
          { texto: '30 Posts Mensais', incluido: true },
          { texto: 'Estratégia de Marketing Digital', incluido: true },
          { texto: 'Campanhas Publicitárias', incluido: true },
          { texto: 'Email Marketing Segmentado', incluido: true },
          { texto: 'Consultoria Estratégica', incluido: true }
        ]
      }
    ];

    this.applyFiltersAndPagination();
  }

  // Getters para o FormArray
  get recursos() {
    return this.serviceForm.get('recursos') as FormArray;
  }

  // Método para criar o formulário
  createServiceForm(): FormGroup {
    return this.formBuilder.group({
      titulo: ['', Validators.required],
      subtitulo: ['', Validators.required],
      preco: [0, [Validators.required, Validators.min(0)]],
      periodo: ['mês', Validators.required],
      categoria: ['design', Validators.required],
      destaque: [false],
      ativo: [true],
      recursos: this.formBuilder.array([
        this.createRecursoFormGroup()
      ])
    });
  }

  // Método para criar um FormGroup de recurso
  createRecursoFormGroup(): FormGroup {
    return this.formBuilder.group({
      texto: ['', Validators.required],
      incluido: [true]
    });
  }

  // Métodos para manipular recursos
  adicionarRecurso(): void {
    this.recursos.push(this.createRecursoFormGroup());
  }

  removerRecurso(index: number): void {
    if (this.recursos.length > 1) {
      this.recursos.removeAt(index);
    }
  }

  // Método para contar serviços por categoria
  getCategoryCount(categoria: 'design' | 'marketing' | 'web' | 'combo'): number {
    return this.services.filter(service => service.categoria === categoria).length;
  }

  // Métodos para filtrar serviços
  filterServices(filter: 'all' | 'design' | 'marketing' | 'web' | 'combo'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o filtro
    this.applyFiltersAndPagination();
  }

  // Método para buscar serviços
  searchServices(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Resetar para a primeira página ao buscar
    this.applyFiltersAndPagination();
  }

  // Aplicar filtros e paginação
  private applyFiltersAndPagination(): void {
    // Aplicar filtros
    let result = [...this.services];

    // Filtrar por categoria
    if (this.currentFilter !== 'all') {
      result = result.filter(service => service.categoria === this.currentFilter);
    }

    // Aplicar o termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(service =>
        service.titulo.toLowerCase().includes(term) ||
        service.subtitulo.toLowerCase().includes(term) ||
        service.recursos.some(recurso => recurso.texto.toLowerCase().includes(term))
      );
    }

    // Calcular total de páginas
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);

    // Aplicar paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredServices = result.slice(startIndex, endIndex);
  }

  // Método para obter um array para a paginação
  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Método para trocar de página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFiltersAndPagination();
  }

  // Métodos para o modal
  abrirModalNovoService(): void {
    this.isEditMode = false;
    this.currentServiceId = null;

    // Limpar o formulário
    this.serviceForm = this.createServiceForm();

    this.showNovoServiceModal = true;
  }

  fecharModalNovoService(): void {
    this.showNovoServiceModal = false;
  }

  salvarNovoService(): void {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;

      if (this.isEditMode && this.currentServiceId) {
        // Atualizar serviço existente
        const index = this.services.findIndex(s => s.id === this.currentServiceId);
        if (index !== -1) {
          this.services[index] = {
            ...this.services[index],
            titulo: formValue.titulo,
            subtitulo: formValue.subtitulo,
            preco: formValue.preco,
            periodo: formValue.periodo,
            categoria: formValue.categoria,
            destaque: formValue.destaque,
            ativo: formValue.ativo,
            recursos: formValue.recursos
          };

          alert(`Plano "${formValue.titulo}" atualizado com sucesso!`);
        }
      } else {
        // Criar novo serviço
        const novoService: Service = {
          id: this.gerarNovoId(),
          titulo: formValue.titulo,
          subtitulo: formValue.subtitulo,
          preco: formValue.preco,
          periodo: formValue.periodo,
          categoria: formValue.categoria,
          destaque: formValue.destaque,
          ativo: formValue.ativo,
          recursos: formValue.recursos
        };

        // Adicionar ao array de serviços
        this.services.unshift(novoService);

        alert(`Plano "${novoService.titulo}" criado com sucesso!`);
      }

      // Fechar o modal e atualizar a visualização
      this.fecharModalNovoService();
      this.applyFiltersAndPagination();
    } else {
      // Marcar campos como tocados para mostrar erros
      this.serviceForm.markAllAsTouched();

      // Verificar erros nos recursos
      this.recursos.controls.forEach(control => {
        control.markAllAsTouched();
      });
    }
  }

  // Método para gerar novo ID
  private gerarNovoId(): number {
    return this.services.length > 0
      ? Math.max(...this.services.map(service => service.id)) + 1
      : 1;
  }

  // Método para verificar erro no formulário
  hasError(controlName: string, errorName: string): boolean {
    const control = this.serviceForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Métodos para ações nos cards
  editarService(id: number): void {
    const service = this.services.find(s => s.id === id);
    if (service) {
      this.isEditMode = true;
      this.currentServiceId = id;

      // Resetar o formulário
      this.serviceForm = this.createServiceForm();

      // Preencher o FormArray de recursos
      this.recursos.clear();
      service.recursos.forEach(recurso => {
        const recursoGroup = this.formBuilder.group({
          texto: [recurso.texto, Validators.required],
          incluido: [recurso.incluido]
        });
        this.recursos.push(recursoGroup);
      });

      // Preencher os outros campos
      this.serviceForm.patchValue({
        titulo: service.titulo,
        subtitulo: service.subtitulo,
        preco: service.preco,
        periodo: service.periodo,
        categoria: service.categoria,
        destaque: service.destaque,
        ativo: service.ativo
      });

      this.showNovoServiceModal = true;
    }
  }

  verDetalhesService(id: number): void {
    const service = this.services.find(s => s.id === id);
    if (service) {
      let recursosTexto = service.recursos
        .map(r => `${r.incluido ? '✓' : '×'} ${r.texto}`)
        .join('\n');

      alert(`Detalhes do Plano:\n\nID: ${service.id}\nTítulo: ${service.titulo}\nSubtítulo: ${service.subtitulo}\nCategoria: ${this.getCategoriaLabel(service.categoria)}\nPreço: ${this.formatCurrency(service.preco)}/${service.periodo}\nDestaque: ${service.destaque ? 'Sim' : 'Não'}\nAtivo: ${service.ativo ? 'Sim' : 'Não'}\n\nRecursos:\n${recursosTexto}`);
    }
  }

  toggleActiveService(id: number): void {
    const service = this.services.find(s => s.id === id);
    if (service) {
      service.ativo = !service.ativo;
      this.applyFiltersAndPagination();

      const status = service.ativo ? 'ativado' : 'desativado';
      alert(`O plano "${service.titulo}" foi ${status} com sucesso!`);
    }
  }

  // Método para obter label da categoria
  getCategoriaLabel(categoria: 'design' | 'marketing' | 'web' | 'combo'): string {
    switch(categoria) {
      case 'design': return 'Design';
      case 'marketing': return 'Marketing';
      case 'web': return 'Web';
      case 'combo': return 'Combo';
      default: return '';
    }
  }

  // Método para formatação de moeda
  formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
}

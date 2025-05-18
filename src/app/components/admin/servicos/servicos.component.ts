// servicos.component.ts atualizado
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface Servico {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: 'design' | 'marketing' | 'web';
  icone: string;
  recursos: string[];
}

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css'
})
export class ServicosComponent implements OnInit {
  servicos: Servico[] = [];
  filteredServicos: Servico[] = [];
  searchTerm: string = '';
  currentFilter: 'all' | 'design' | 'marketing' | 'web' = 'all';

  // Modal e Formulário
  showNovoServicoModal: boolean = false;
  servicoForm: FormGroup;
  isEditMode: boolean = false;
  currentServicoId: number | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private formBuilder: FormBuilder) {
    this.servicoForm = this.createServicoForm();
  }

  ngOnInit(): void {
    // Simular dados de serviços
    this.servicos = [
      {
        id: 1,
        titulo: 'Design de Identidade Visual',
        descricao: 'Criação de logotipos, paletas de cores e elementos visuais para sua marca se destacar no mercado.',
        preco: 599,
        categoria: 'design',
        icone: 'design-icon.svg',
        recursos: ['Logo', 'Paleta de Cores', 'Guia de Estilo', 'Arquivos Editáveis']
      },
      {
        id: 2,
        titulo: 'Gestão de Redes Sociais',
        descricao: 'Estratégia e gerenciamento completo das suas redes sociais para aumentar engajamento e conversões.',
        preco: 899,
        categoria: 'marketing',
        icone: 'social-icon.svg',
        recursos: ['Estratégia', 'Posts Diários', 'Análise de Dados', 'Relatórios Mensais']
      },
      {
        id: 3,
        titulo: 'Desenvolvimento de Site Responsivo',
        descricao: 'Criação de sites modernos, responsivos e otimizados para todos os dispositivos.',
        preco: 1299,
        categoria: 'web',
        icone: 'web-icon.svg',
        recursos: ['Design Responsivo', 'SEO Básico', 'Formulários', 'Analytics']
      },
      {
        id: 4,
        titulo: 'Campanha de Marketing Digital',
        descricao: 'Planejamento e execução de campanhas digitais focadas em atrair e converter leads qualificados.',
        preco: 1499,
        categoria: 'marketing',
        icone: 'campaign-icon.svg',
        recursos: ['Google Ads', 'Facebook Ads', 'Email Marketing', 'Relatórios']
      },
      {
        id: 5,
        titulo: 'Design de Material Impresso',
        descricao: 'Criação de cartões, folhetos, flyers e outros materiais impressos para sua marca.',
        preco: 399,
        categoria: 'design',
        icone: 'print-icon.svg',
        recursos: ['Cartões', 'Flyers', 'Catálogos', 'Preparação para Impressão']
      },
      {
        id: 6,
        titulo: 'E-commerce Completo',
        descricao: 'Desenvolvimento de loja online completa com gestão de produtos, pagamentos e envios.',
        preco: 2499,
        categoria: 'web',
        icone: 'shop-icon.svg',
        recursos: ['Catálogo de Produtos', 'Pagamentos Online', 'Gestão de Estoque', 'Integrações']
      },
      {
        id: 7,
        titulo: 'SEO Avançado',
        descricao: 'Otimização completa do seu site para os motores de busca, aumentando seu tráfego orgânico.',
        preco: 799,
        categoria: 'web',
        icone: 'seo-icon.svg',
        recursos: ['Análise de Keywords', 'Otimização On-page', 'Link Building', 'Relatórios Mensais']
      },
      {
        id: 8,
        titulo: 'Branding Completo',
        descricao: 'Desenvolvimento completo da identidade da sua marca, desde o conceito até as aplicações.',
        preco: 1899,
        categoria: 'design',
        icone: 'branding-icon.svg',
        recursos: ['Posicionamento', 'Logo', 'Manual da Marca', 'Papelaria']
      }
    ];

    this.applyFiltersAndPagination();
  }

  // Getters para o FormArray
  get recursos() {
    return this.servicoForm.get('recursos') as FormArray;
  }

  // Método para criar o formulário
  createServicoForm(): FormGroup {
    return this.formBuilder.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      preco: [0, [Validators.required, Validators.min(0)]],
      categoria: ['design', Validators.required],
      icone: ['', Validators.required],
      recursos: this.formBuilder.array([
        this.formBuilder.control('', Validators.required)
      ])
    });
  }

  // Métodos para manipular recursos
  adicionarRecurso(): void {
    this.recursos.push(this.formBuilder.control('', Validators.required));
  }

  removerRecurso(index: number): void {
    if (this.recursos.length > 1) {
      this.recursos.removeAt(index);
    }
  }

  // Métodos para filtrar serviços
  filterServicos(filter: 'all' | 'design' | 'marketing' | 'web'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o filtro
    this.applyFiltersAndPagination();
  }

  // Método para buscar serviços
  searchServicos(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Resetar para a primeira página ao buscar
    this.applyFiltersAndPagination();
  }

  // Aplicar filtros e paginação
  private applyFiltersAndPagination(): void {
    // Aplicar filtros
    let result = [...this.servicos];

    // Filtrar por categoria
    if (this.currentFilter !== 'all') {
      result = result.filter(servico => servico.categoria === this.currentFilter);
    }

    // Aplicar o termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(servico =>
        servico.titulo.toLowerCase().includes(term) ||
        servico.descricao.toLowerCase().includes(term) ||
        servico.recursos.some(recurso => recurso.toLowerCase().includes(term))
      );
    }

    // Calcular total de páginas
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);

    // Aplicar paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredServicos = result.slice(startIndex, endIndex);
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
  abrirModalNovoServico(): void {
    this.isEditMode = false;
    this.currentServicoId = null;

    // Limpar o formulário
    this.servicoForm = this.createServicoForm();

    this.showNovoServicoModal = true;
  }

  fecharModalNovoServico(): void {
    this.showNovoServicoModal = false;
  }

  salvarNovoServico(): void {
    if (this.servicoForm.valid) {
      const formValue = this.servicoForm.value;

      if (this.isEditMode && this.currentServicoId) {
        // Atualizar serviço existente
        const index = this.servicos.findIndex(s => s.id === this.currentServicoId);
        if (index !== -1) {
          this.servicos[index] = {
            ...this.servicos[index],
            titulo: formValue.titulo,
            descricao: formValue.descricao,
            preco: formValue.preco,
            categoria: formValue.categoria,
            icone: formValue.icone,
            recursos: formValue.recursos
          };

          alert(`Serviço "${formValue.titulo}" atualizado com sucesso!`);
        }
      } else {
        // Criar novo serviço
        const novoServico: Servico = {
          id: this.gerarNovoId(),
          titulo: formValue.titulo,
          descricao: formValue.descricao,
          preco: formValue.preco,
          categoria: formValue.categoria,
          icone: formValue.icone,
          recursos: formValue.recursos
        };

        // Adicionar ao array de serviços
        this.servicos.unshift(novoServico);

        alert(`Serviço "${novoServico.titulo}" criado com sucesso!`);
      }

      // Fechar o modal e atualizar a visualização
      this.fecharModalNovoServico();
      this.applyFiltersAndPagination();
    } else {
      // Marcar campos como tocados para mostrar erros
      this.servicoForm.markAllAsTouched();

      // Verificar erros nos recursos
      this.recursos.controls.forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Método para gerar novo ID
  private gerarNovoId(): number {
    return this.servicos.length > 0
      ? Math.max(...this.servicos.map(servico => servico.id)) + 1
      : 1;
  }

  // Método para verificar erro no formulário
  hasError(controlName: string, errorName: string): boolean {
    const control = this.servicoForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Métodos para ações nos cards
  editarServico(id: number): void {
    const servico = this.servicos.find(s => s.id === id);
    if (servico) {
      this.isEditMode = true;
      this.currentServicoId = id;

      // Resetar o formulário
      this.servicoForm = this.createServicoForm();

      // Preencher o FormArray de recursos
      this.recursos.clear();
      servico.recursos.forEach(recurso => {
        this.recursos.push(this.formBuilder.control(recurso, Validators.required));
      });

      // Preencher os outros campos
      this.servicoForm.patchValue({
        titulo: servico.titulo,
        descricao: servico.descricao,
        preco: servico.preco,
        categoria: servico.categoria,
        icone: servico.icone
      });

      this.showNovoServicoModal = true;
    }
  }

  verDetalhesServico(id: number): void {
    const servico = this.servicos.find(s => s.id === id);
    if (servico) {
      let recursosTexto = servico.recursos.join(', ');
      alert(`Detalhes do Serviço:\n\nID: ${servico.id}\nTítulo: ${servico.titulo}\nCategoria: ${this.getCategoriaLabel(servico.categoria)}\nPreço: ${this.formatCurrency(servico.preco)}\n\nRecursos: ${recursosTexto}`);
    }
  }

  excluirServico(id: number): void {
    const servico = this.servicos.find(s => s.id === id);
    if (servico && confirm(`Tem certeza que deseja excluir o serviço "${servico.titulo}"?`)) {
      const index = this.servicos.findIndex(s => s.id === id);
      if (index !== -1) {
        this.servicos.splice(index, 1);
        this.applyFiltersAndPagination();
        alert(`Serviço "${servico.titulo}" excluído com sucesso!`);
      }
    }
  }

  // Método para obter label da categoria
  getCategoriaLabel(categoria: 'design' | 'marketing' | 'web'): string {
    switch(categoria) {
      case 'design': return 'Design';
      case 'marketing': return 'Marketing';
      case 'web': return 'Web';
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

// idvs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface IDV {
  id: number;
  titulo: string;
  cliente: string;
  descricao: string;
  dataInicio: Date;
  dataEntrega: Date;
  imagemUrl: string;
  status: 'pending' | 'in-progress' | 'completed';
  tags: string[];
}

@Component({
  selector: 'app-idvs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './idvs.component.html',
  styleUrl: './idvs.component.css'
})
export class IdvsComponent implements OnInit {
  idvs: IDV[] = [];
  filteredIDVs: IDV[] = [];
  searchTerm: string = '';
  currentFilter: 'all' | 'pending' | 'in-progress' | 'completed' = 'all';

  // Modal e Formulário
  showNovoIDVModal: boolean = false;
  idvForm: FormGroup;
  isEditMode: boolean = false;
  currentIDVId: number | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private formBuilder: FormBuilder) {
    this.idvForm = this.createIDVForm();
  }

  ngOnInit(): void {
    // Simular dados de projetos IDV
    this.idvs = [
      {
        id: 1,
        titulo: 'Redesign Logo Café Aroma',
        cliente: 'Café Aroma Ltda',
        descricao: 'Redesenho completo da identidade visual para uma cafeteria artesanal com foco em sustentabilidade e produtos orgânicos.',
        dataInicio: new Date(2025, 3, 10),
        dataEntrega: new Date(2025, 4, 15),
        imagemUrl: 'assets/images/idv-cafe.jpg',
        status: 'completed',
        tags: ['Logo', 'Branding', 'Sustentabilidade']
      },
      {
        id: 2,
        titulo: 'Identidade Visual TechSolution',
        cliente: 'TechSolution Inc',
        descricao: 'Criação de identidade visual completa para empresa de soluções tecnológicas em expansão, incluindo logo, papelaria e manual de marca.',
        dataInicio: new Date(2025, 4, 1),
        dataEntrega: new Date(2025, 5, 10),
        imagemUrl: 'assets/images/idv-tech.jpg',
        status: 'in-progress',
        tags: ['Logo', 'Tech', 'Manual de Marca', 'Papelaria']
      },
      {
        id: 3,
        titulo: 'Branding Escola Criativa',
        cliente: 'Escola Criativa Educar',
        descricao: 'Desenvolvimento de identidade visual para escola de ensino infantil, com foco em cores vivas e elementos lúdicos.',
        dataInicio: new Date(2025, 4, 20),
        dataEntrega: new Date(2025, 6, 1),
        imagemUrl: 'assets/images/idv-escola.jpg',
        status: 'pending',
        tags: ['Educação', 'Infantil', 'Colorido', 'Logo']
      },
      {
        id: 4,
        titulo: 'Redesign Clínica Saúde',
        cliente: 'Clínica Saúde Integral',
        descricao: 'Atualização da identidade visual de uma clínica médica com 15 anos de mercado, modernizando sua comunicação visual.',
        dataInicio: new Date(2025, 3, 5),
        dataEntrega: new Date(2025, 4, 10),
        imagemUrl: 'assets/images/idv-clinica.jpg',
        status: 'completed',
        tags: ['Saúde', 'Redesign', 'Clínica']
      },
      {
        id: 5,
        titulo: 'Identidade Restaurante Sabor',
        cliente: 'Restaurante Sabor Caseiro',
        descricao: 'Desenvolvimento de marca para restaurante de comida caseira tradicional, com elementos que remetem à tradição familiar.',
        dataInicio: new Date(2025, 4, 15),
        dataEntrega: new Date(2025, 5, 20),
        imagemUrl: 'assets/images/idv-restaurante.jpg',
        status: 'in-progress',
        tags: ['Gastronomia', 'Tradição', 'Branding']
      },
      {
        id: 6,
        titulo: 'Logo e Branding FitLife',
        cliente: 'Academia FitLife',
        descricao: 'Criação de identidade visual para nova rede de academias com foco em bem-estar e fitness funcional.',
        dataInicio: new Date(2025, 5, 1),
        dataEntrega: new Date(2025, 6, 15),
        imagemUrl: 'assets/images/idv-fitness.jpg',
        status: 'pending',
        tags: ['Fitness', 'Esporte', 'Academia', 'Bem-estar']
      },
      {
        id: 7,
        titulo: 'Identidade Visual Moda Primavera',
        cliente: 'Boutique Primavera',
        descricao: 'Desenvolvimento de marca para boutique de moda feminina com foco em sustentabilidade e peças atemporais.',
        dataInicio: new Date(2025, 3, 20),
        dataEntrega: new Date(2025, 4, 30),
        imagemUrl: 'assets/images/idv-moda.jpg',
        status: 'completed',
        tags: ['Moda', 'Sustentabilidade', 'Feminino']
      },
      {
        id: 8,
        titulo: 'Branding Completo Imobiliária Espaço',
        cliente: 'Imobiliária Espaço Ideal',
        descricao: 'Criação de identidade visual para imobiliária especializada em imóveis de alto padrão e arquitetura contemporânea.',
        dataInicio: new Date(2025, 4, 25),
        dataEntrega: new Date(2025, 6, 10),
        imagemUrl: 'assets/images/idv-imobiliaria.jpg',
        status: 'in-progress',
        tags: ['Imóveis', 'Arquitetura', 'Luxo', 'Logo']
      }
    ];

    this.applyFiltersAndPagination();
  }

  // Getters para o FormArray
  get tags() {
    return this.idvForm.get('tags') as FormArray;
  }

  // Método para criar o formulário
  createIDVForm(): FormGroup {
    return this.formBuilder.group({
      titulo: ['', Validators.required],
      cliente: ['', Validators.required],
      descricao: ['', Validators.required],
      dataInicio: ['', Validators.required],
      dataEntrega: ['', Validators.required],
      imagemUrl: ['', Validators.required],
      status: ['pending', Validators.required],
      tags: this.formBuilder.array([
        this.formBuilder.control('', Validators.required)
      ])
    });
  }

  // Métodos para manipular tags
  adicionarTag(): void {
    this.tags.push(this.formBuilder.control('', Validators.required));
  }

  removerTag(index: number): void {
    if (this.tags.length > 1) {
      this.tags.removeAt(index);
    }
  }

  // Métodos para filtrar IDVs
  filterIDVs(filter: 'all' | 'pending' | 'in-progress' | 'completed'): void {
    this.currentFilter = filter;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o filtro
    this.applyFiltersAndPagination();
  }

  // Método para buscar IDVs
  searchIDVs(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Resetar para a primeira página ao buscar
    this.applyFiltersAndPagination();
  }

  // Aplicar filtros e paginação
  private applyFiltersAndPagination(): void {
    // Aplicar filtros
    let result = [...this.idvs];

    // Filtrar por status
    if (this.currentFilter !== 'all') {
      result = result.filter(idv => idv.status === this.currentFilter);
    }

    // Aplicar o termo de busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(idv =>
        idv.titulo.toLowerCase().includes(term) ||
        idv.cliente.toLowerCase().includes(term) ||
        idv.descricao.toLowerCase().includes(term) ||
        idv.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Calcular total de páginas
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);

    // Aplicar paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredIDVs = result.slice(startIndex, endIndex);
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
  abrirModalNovoIDV(): void {
    this.isEditMode = false;
    this.currentIDVId = null;

    // Limpar o formulário
    this.idvForm = this.createIDVForm();

    // Preencher com data atual e data estimada em 30 dias
    const hoje = new Date();
    const dataEntrega = new Date();
    dataEntrega.setDate(hoje.getDate() + 30);

    this.idvForm.patchValue({
      dataInicio: this.formatDateForInput(hoje),
      dataEntrega: this.formatDateForInput(dataEntrega)
    });

    this.showNovoIDVModal = true;
  }

  fecharModalNovoIDV(): void {
    this.showNovoIDVModal = false;
  }

  salvarNovoIDV(): void {
    if (this.idvForm.valid) {
      const formValue = this.idvForm.value;

      if (this.isEditMode && this.currentIDVId) {
        // Atualizar IDV existente
        const index = this.idvs.findIndex(i => i.id === this.currentIDVId);
        if (index !== -1) {
          this.idvs[index] = {
            ...this.idvs[index],
            titulo: formValue.titulo,
            cliente: formValue.cliente,
            descricao: formValue.descricao,
            dataInicio: new Date(formValue.dataInicio),
            dataEntrega: new Date(formValue.dataEntrega),
            imagemUrl: formValue.imagemUrl,
            status: formValue.status,
            tags: formValue.tags
          };

          alert(`Projeto "${formValue.titulo}" atualizado com sucesso!`);
        }
      } else {
        // Criar novo IDV
        const novoIDV: IDV = {
          id: this.gerarNovoId(),
          titulo: formValue.titulo,
          cliente: formValue.cliente,
          descricao: formValue.descricao,
          dataInicio: new Date(formValue.dataInicio),
          dataEntrega: new Date(formValue.dataEntrega),
          imagemUrl: formValue.imagemUrl,
          status: formValue.status,
          tags: formValue.tags
        };

        // Adicionar ao array de IDVs
        this.idvs.unshift(novoIDV);

        alert(`Projeto "${novoIDV.titulo}" criado com sucesso!`);
      }

      // Fechar o modal e atualizar a visualização
      this.fecharModalNovoIDV();
      this.applyFiltersAndPagination();
    } else {
      // Marcar campos como tocados para mostrar erros
      this.idvForm.markAllAsTouched();

      // Verificar erros nas tags
      this.tags.controls.forEach(control => {
        control.markAsTouched();
      });
    }
  }

  // Método para formatar data para input type="date"
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Método para gerar novo ID
  private gerarNovoId(): number {
    return this.idvs.length > 0
      ? Math.max(...this.idvs.map(idv => idv.id)) + 1
      : 1;
  }

  // Método para verificar erro no formulário
  hasError(controlName: string, errorName: string): boolean {
    const control = this.idvForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // Método para obter label do status
  getStatusLabel(status: 'pending' | 'in-progress' | 'completed'): string {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'in-progress': return 'Em Andamento';
      case 'completed': return 'Concluído';
      default: return '';
    }
  }

  // Métodos para ações nos cards
  editarIDV(id: number): void {
    const idv = this.idvs.find(i => i.id === id);
    if (idv) {
      this.isEditMode = true;
      this.currentIDVId = id;

      // Resetar o formulário
      this.idvForm = this.createIDVForm();

      // Preencher o FormArray de tags
      this.tags.clear();
      idv.tags.forEach(tag => {
        this.tags.push(this.formBuilder.control(tag, Validators.required));
      });

      // Preencher os outros campos
      this.idvForm.patchValue({
        titulo: idv.titulo,
        cliente: idv.cliente,
        descricao: idv.descricao,
        dataInicio: this.formatDateForInput(idv.dataInicio),
        dataEntrega: this.formatDateForInput(idv.dataEntrega),
        imagemUrl: idv.imagemUrl,
        status: idv.status
      });

      this.showNovoIDVModal = true;
    }
  }

  verDetalhesIDV(id: number): void {
    const idv = this.idvs.find(i => i.id === id);
    if (idv) {
      let tagsTexto = idv.tags.join(', ');
      let dataInicio = idv.dataInicio.toLocaleDateString('pt-BR');
      let dataEntrega = idv.dataEntrega.toLocaleDateString('pt-BR');

      alert(`Detalhes do Projeto:\n\nID: ${idv.id}\nTítulo: ${idv.titulo}\nCliente: ${idv.cliente}\nStatus: ${this.getStatusLabel(idv.status)}\nData de Início: ${dataInicio}\nData de Entrega: ${dataEntrega}\n\nTags: ${tagsTexto}`);
    }
  }

  iniciarIDV(id: number): void {
    const idv = this.idvs.find(i => i.id === id);
    if (idv && idv.status === 'pending') {
      idv.status = 'in-progress';
      this.applyFiltersAndPagination();
      alert(`O projeto "${idv.titulo}" foi iniciado com sucesso!`);
    }
  }

  concluirIDV(id: number): void {
    const idv = this.idvs.find(i => i.id === id);
    if (idv && idv.status === 'in-progress') {
      idv.status = 'completed';
      this.applyFiltersAndPagination();
      alert(`O projeto "${idv.titulo}" foi concluído com sucesso!`);
    }
  }

  baixarArquivosIDV(id: number): void {
    const idv = this.idvs.find(i => i.id === id);
    if (idv && idv.status === 'completed') {
      alert(`Iniciando download dos arquivos do projeto "${idv.titulo}". Esta funcionalidade ainda está em desenvolvimento.`);
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

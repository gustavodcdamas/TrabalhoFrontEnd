import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { servicosService } from '../../../services/servico/servico.service';
import { lastValueFrom } from 'rxjs';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMagnifyingGlass, faPen, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';
import { servicos } from '../../../models/servicos.model'
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth/auth.service';
import { library } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './servicos.component.html',
  styleUrl: './servicos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServicosComponent implements OnInit {
  // Dados
  servicos: servicos[] = [];
  filteredServicos: servicos[] = [];

  // Filtros e busca
  searchTerm: string = '';
  currentFilter: 'all' | 'ativo' | 'inativo' | 'excluido' = 'all';
  currentSort: 'recentes' | 'antigos' = 'recentes';

  // Estados
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  isDeleting: boolean = false;

  // Modal
  showNovoServicosModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  currentServicosId: string | null = null;
  currentImagePreview: string | null = null;
  itemToDelete: servicos | null = null;

  // Formulário
  servicosForm: FormGroup;
  selectedFile: File | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  // Debug
  showDebugInfo: boolean = false; // Mude para true em desenvolvimento

  constructor(
    private formBuilder: FormBuilder,
    private servicosService: servicosService,
    library: FaIconLibrary,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.servicosForm = this.createServicosForm();
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular,
      faWhatsapp, faMagnifyingGlass, faPen, faFilter, faTrash
    );
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Usuário não está logado');
      // Redirecionar para login ou mostrar mensagem
      return;
    }
    
    console.log('✅ Usuário logado:', this.authService.currentUserValue);
    await this.carregarServicos();
  }

  // ===== MÉTODOS DE FORMULÁRIO =====
  
  createServicosForm(): FormGroup {
    return this.formBuilder.group({
      titulo: [''],
      cliente: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      image: [''],
      status: ['ativo']
    });
  }

  isFormValid(): boolean {
    if (this.isEditMode) {
      // Em modo edição, ícone é opcional
      return this.servicosForm.valid;
    } else {
      // Em modo criação, ícone é obrigatório
      return this.servicosForm.valid && this.selectedFile !== null;
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.servicosForm.controls).forEach(key => {
      const control = this.servicosForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.servicosForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // ===== MÉTODOS DE ARQUIVO =====

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validar tamanho do arquivo (5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Validar tipo do arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        alert('Tipo de arquivo não suportado. Use: JPG, PNG ou WebP');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Atualizar formulário
      this.servicosForm.patchValue({ image: 'arquivo-selecionado' });
      this.servicosForm.get('image')?.markAsTouched();
      this.cdr.detectChanges();
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/placeholder.jpg';
    }

    // Se já é uma URL completa
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // ✅ CORREÇÃO: Remover barras duplas e adicionar aspas na template string
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://localhost:3333/uploads/${cleanPath}`;
  }

  // ✅ MÉTODO onImageError TAMBÉM CORRIGIDO:
  onImageError(event: any): void {
    console.log('❌ Erro ao carregar imagem:', event.target.src);
    
    // Evitar loop infinito de erro
    if (event.target.src.includes('placeholder.jpg')) {
      return;
    }
    
    // Tentar diferentes caminhos antes do placeholder
    const originalSrc = event.target.src;
    
    if (originalSrc.includes('/uploads/')) {
      // Tentar sem a pasta uploads
      const fileName = originalSrc.split('/uploads/')[1];
      event.target.src = `http://localhost:3333/${fileName}`;
      return;
    }
    
    // Se tudo falhar, usar placeholder
    event.target.src = '/assets/images/placeholder.jpg';
  }

  // ===== MÉTODOS PRINCIPAIS =====

  async salvarServicos(): Promise<void> {
    console.log('🎯 salvarServicos() iniciado');
    
    try {
      // ✅ VERIFICAÇÃO OBRIGATÓRIA ANTES DE SALVAR
      const token = this.authService.token;
      const isLoggedIn = this.authService.isLoggedIn();
      
      console.log('🔍 Verificação antes de salvar:', {
        hasToken: !!token,
        isLoggedIn,
        currentUser: this.authService.currentUserValue
      });
      
      if (!token || !isLoggedIn) {
        console.error('🚨 Usuário não está autenticado!');
        alert('Sessão expirada. Faça login novamente.');
        this.authService.logout();
        return;
      }

      // ✅ VALIDAÇÃO DO FORMULÁRIO
      if (!this.isFormValid()) {
        console.log('❌ Formulário inválido');
        this.servicosForm.markAllAsTouched();
        this.cdr.detectChanges();
        return;
      }

      this.isSubmitting = true;
      this.cdr.detectChanges();

      // ✅ PREPARAR FORMDATA
      const formData = new FormData();
      formData.append('cliente', this.servicosForm.value.cliente);
      formData.append('descricao', this.servicosForm.value.descricao);
      
      if (this.servicosForm.value.titulo) {
        formData.append('titulo', this.servicosForm.value.titulo);
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.isEditMode) {
        formData.append('status', this.servicosForm.value.status);
      }

      console.log('📦 FormData preparado:', {
        cliente: this.servicosForm.value.cliente,
        descricao: this.servicosForm.value.descricao,
        titulo: this.servicosForm.value.titulo,
        hasImage: !!this.selectedFile,
        isEditMode: this.isEditMode
      });

      // ✅ EXECUTAR OPERAÇÃO
      let result;
      if (this.isEditMode && this.currentServicosId) {
        console.log('📝 Atualizando serviço existente...');
        result = await lastValueFrom(
          this.servicosService.update(this.currentServicosId, formData)
        );
        this.showSuccessMessage('Serviço atualizado com sucesso!');
      } else {
        console.log('📞 Chamando servicosService.create()...');
        result = await lastValueFrom(
          this.servicosService.create(formData)
        );
        console.log('✅ Resultado recebido:', result);
        this.showSuccessMessage('Serviço criado com sucesso!');
      }

      // ✅ FINALIZAR
      this.fecharModalNovoServicos();
      await this.carregarServicos();
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      this.showErrorMessage(this.getErrorMessage(error));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async deletarServicos(id: string): Promise<void> {
    const servicos = this.servicos.find(i => i.id === id);
    if (!servicos) return;

    this.itemToDelete = servicos;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  async confirmarExclusao(): Promise<void> {
    if (!this.itemToDelete) return;

    try {
      this.isDeleting = true;
      this.cdr.detectChanges();

      await lastValueFrom(this.servicosService.delete(this.itemToDelete.id));
      
      this.showSuccessMessage('Serviço excluído com sucesso!');
      this.cancelarExclusao();
      await this.carregarServicos();
      
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      this.showErrorMessage(this.getErrorMessage(error));
    } finally {
      this.isDeleting = false;
      this.cdr.detectChanges();
    }
  }

  cancelarExclusao(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
    this.isDeleting = false;
    this.cdr.detectChanges();
  }

  // ===== MÉTODOS DE CARREGAMENTO =====

  private async carregarServicos(): Promise<void> {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const servicos$ = this.servicosService.getAll();
      this.servicos = await lastValueFrom(servicos$);
      this.applyFiltersAndPagination();
      
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      this.showErrorMessage('Erro ao carregar serviços. Tente novamente.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ===== MÉTODOS DE FILTRO E PAGINAÇÃO =====

  private applyFiltersAndPagination(): void {
    let result = [...this.servicos];
    
    // Aplicar filtro de status
    if (this.currentFilter !== 'all') {
      result = result.filter(item => item.status === this.currentFilter);
    }
    
    // Aplicar busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item =>
        item.titulo.toLowerCase().includes(term) ||
        item.cliente.toLowerCase().includes(term) ||
        item.descricao.toLowerCase().includes(term)
      );
    }

    // Ordenar
    result.sort((a, b) => {
      const dateA = new Date(a.dataCriacao).getTime();
      const dateB = new Date(b.dataCriacao).getTime();
      return this.currentSort === 'recentes' ? dateB - dateA : dateA - dateB;
    });

    // Calcular paginação
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    
    // Ajustar página atual se necessário
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    // Aplicar paginação
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredServicos = result.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  filterServicos(filter: 'all' | 'ativo' | 'inativo' | 'excluido'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  searchServicos(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  toggleSort(): void {
    this.currentSort = this.currentSort === 'recentes' ? 'antigos' : 'recentes';
    this.applyFiltersAndPagination();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFiltersAndPagination();
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getTotalItems(): number {
    let result = [...this.servicos];
    
    if (this.currentFilter !== 'all') {
      result = result.filter(item => item.status === this.currentFilter);
    }
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item =>
        item.titulo.toLowerCase().includes(term) ||
        item.cliente.toLowerCase().includes(term) ||
        item.descricao.toLowerCase().includes(term)
      );
    }
    
    return result.length;
  }

  // ===== MÉTODOS DE MODAL =====

  abrirModalNovoServicos(): void {
    this.isEditMode = false;
    this.currentServicosId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.servicosForm = this.createServicosForm();
    this.showNovoServicosModal = true;
    this.cdr.detectChanges();
  }

  editarServicos(id: string): void {
    const servicos = this.servicos.find(i => i.id === id);
    if (!servicos) return;

    this.isEditMode = true;
    this.currentServicosId = id;
    this.currentImagePreview = this.getImageUrl(servicos.image);
    this.selectedFile = null;

    this.servicosForm = this.createServicosForm();
    this.servicosForm.patchValue({
      titulo: servicos.titulo,
      cliente: servicos.cliente,
      descricao: servicos.descricao,
      status: servicos.status
    });

    this.showNovoServicosModal = true;
    this.cdr.detectChanges();
  }

  fecharModalNovoServicos(): void {
    this.showNovoServicosModal = false;
    this.isEditMode = false;
    this.currentServicosId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  verDetalhesServicos(id: string): void {
    const servicos = this.servicos.find(i => i.id === id);
    if (!servicos) return;

    const detalhes = `
      Detalhes do Serviço:

      ID: ${servicos.id}
      Título: ${servicos.titulo}
      Cliente: ${servicos.cliente}
      Descrição: ${servicos.descricao}
      Status: ${servicos.status}
      Criado em: ${this.formatDate(servicos.dataCriacao)}
      Atualizado em: ${this.formatDate(servicos.dataAtualizacao)}
    `.trim();

    alert(detalhes);
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEmptyStateMessage(): string {
    if (this.searchTerm) {
      return 'Nenhum serviço encontrado';
    }
    if (this.currentFilter !== 'all') {
      return `Nenhum serviço ${this.currentFilter} encontrado`;
    }
    return 'Nenhum serviço cadastrado';
  }

  getEmptyStateDescription(): string {
    if (this.searchTerm) {
      return `Não encontramos serviços que correspondam a "${this.searchTerm}". Tente outros termos de busca.`;
    }
    if (this.currentFilter !== 'all') {
      return `Não há serviços com status "${this.currentFilter}" no momento.`;
    }
    return 'Comece criando seu primeiro serviço.';
  }

  private getErrorMessage(error: any): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) {
        return 'Acesso negado. Verifique suas permissões.';
      }
      if (error.status === 401) {
        return 'Sessão expirada. Faça login novamente.';
      }
      if (error.status === 413) {
        return 'Arquivo muito grande. Tamanho máximo: 5MB.';
      }
      if (error.error?.message) {
        return error.error.message;
      }
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  private showSuccessMessage(message: string): void {
    // Implementar toast/notification aqui
    alert(message); // Temporário
  }

  private showErrorMessage(message: string): void {
    // Implementar toast/notification aqui
    alert(message); // Temporário
  }
}
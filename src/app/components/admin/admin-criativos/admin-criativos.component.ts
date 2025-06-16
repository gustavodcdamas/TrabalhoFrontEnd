import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CriativosService } from '../../../services/criativo/criativo.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth/auth.service';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMagnifyingGlass, faPen, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';

interface criativos {
  id: string;
  titulo: string;
  cliente: string;
  descricao: string;
  image: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
  status: 'ativo' | 'inativo' | 'excluido';
  excluidoPor?: string;
  dataExclusao?: Date;
}

@Component({
  selector: 'app-criativos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './admin-criativos.component.html',
  styleUrl: './admin-criativos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCriativosComponent implements OnInit {
  // Dados
  criativos: criativos[] = [];
  filteredCriativos: criativos[] = [];

  // Filtros e busca
  searchTerm: string = '';
  currentFilter: 'all' | 'ativo' | 'inativo' | 'excluido' = 'all';
  currentSort: 'recentes' | 'antigos' = 'recentes';

  // Estados
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  isDeleting: boolean = false;

  // Modal
  showNovoCriativosModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  currentCriativosId: string | null = null;
  currentImagePreview: string | null = null;
  itemToDelete: criativos | null = null;

  // Formulário
  criativosForm: FormGroup;
  selectedFile: File | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  // Debug
  showDebugInfo: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private criativosService: CriativosService,
    private http: HttpClient,
    library: FaIconLibrary,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.criativosForm = this.createCriativosForm();
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular,
      faWhatsapp, faMagnifyingGlass, faPen, faFilter, faTrash
    );
  }

  async ngOnInit(): Promise<void> {
    console.log('🚀 Criativos Component - Inicializando...');
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Criativos Component - Usuário não está logado');
      return;
    }
    
    console.log('✅ Criativos Component - Usuário logado:', this.authService.currentUserValue);
    await this.carregarCriativos();
  }

  // ===== MÉTODOS DE FORMULÁRIO =====
  
  createCriativosForm(): FormGroup {
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
      return this.criativosForm.valid;
    } else {
      return this.criativosForm.valid && this.selectedFile !== null;
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.criativosForm.controls).forEach(key => {
      const control = this.criativosForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.criativosForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // ===== MÉTODOS DE ARQUIVO =====

  onFileSelected(event: Event): void {
    console.log('📁 Criativos Component - Arquivo selecionado');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validar tamanho do arquivo (5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        console.warn('⚠️ Criativos Component - Arquivo muito grande:', this.selectedFile.size);
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Validar tipo do arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.warn('⚠️ Criativos Component - Tipo de arquivo não suportado:', this.selectedFile.type);
        alert('Tipo de arquivo não suportado. Use: JPG, PNG ou WebP');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      console.log('✅ Criativos Component - Arquivo válido:', this.selectedFile.name);
      this.criativosForm.patchValue({ image: 'arquivo-selecionado' });
      this.criativosForm.get('image')?.markAsTouched();
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

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://localhost:3333/uploads/${cleanPath}`;
  }

  onImageError(event: any): void {
    console.log('❌ Criativos Component - Erro ao carregar imagem:', event.target.src);
    
    if (event.target.src.includes('placeholder.jpg')) {
      return;
    }
    
    const originalSrc = event.target.src;
    
    if (originalSrc.includes('/uploads/')) {
      const fileName = originalSrc.split('/uploads/')[1];
      event.target.src = `http://localhost:3333/${fileName}`;
      return;
    }
    
    event.target.src = '/assets/images/placeholder.jpg';
  }

  // ===== MÉTODOS PRINCIPAIS =====

  async salvarCriativos(): Promise<void> {
    console.log('🎯 Criativos Component - salvarCriativos() iniciado');
    
    try {
      const token = this.authService.token;
      const isLoggedIn = this.authService.isLoggedIn();
      
      console.log('🔍 Criativos Component - Verificação antes de salvar:', {
        hasToken: !!token,
        isLoggedIn,
        currentUser: this.authService.currentUserValue
      });
      
      if (!token || !isLoggedIn) {
        console.error('🚨 Criativos Component - Usuário não está autenticado!');
        alert('Sessão expirada. Faça login novamente.');
        this.authService.logout();
        return;
      }

      if (!this.isFormValid()) {
        console.log('❌ Criativos Component - Formulário inválido');
        this.criativosForm.markAllAsTouched();
        this.cdr.detectChanges();
        return;
      }

      this.isSubmitting = true;
      this.cdr.detectChanges();

      const formData = new FormData();
      formData.append('cliente', this.criativosForm.value.cliente);
      formData.append('descricao', this.criativosForm.value.descricao);
      
      if (this.criativosForm.value.titulo) {
        formData.append('titulo', this.criativosForm.value.titulo);
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.isEditMode) {
        formData.append('status', this.criativosForm.value.status);
      }

      console.log('📦 Criativos Component - FormData preparado:', {
        cliente: this.criativosForm.value.cliente,
        descricao: this.criativosForm.value.descricao,
        titulo: this.criativosForm.value.titulo,
        hasImage: !!this.selectedFile,
        isEditMode: this.isEditMode
      });

      let result;
      if (this.isEditMode && this.currentCriativosId) {
        console.log('📝 Criativos Component - Atualizando criativo existente...');
        result = await lastValueFrom(
          this.criativosService.update(this.currentCriativosId, formData)
        );
        this.showSuccessMessage('Projeto criativo atualizado com sucesso!');
      } else {
        console.log('📞 Criativos Component - Chamando criativosService.create()...');
        result = await lastValueFrom(
          this.criativosService.create(formData)
        );
        console.log('✅ Criativos Component - Resultado recebido:', result);
        this.showSuccessMessage('Projeto criativo criado com sucesso!');
      }

      this.fecharModalNovoCriativos();
      await this.carregarCriativos();
      
    } catch (error: any) {
      console.error('❌ Criativos Component - Erro ao salvar:', error);
      this.showErrorMessage(this.getErrorMessage(error));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async deletarCriativos(id: string): Promise<void> {
    console.log('🗑️ Criativos Component - Preparando para deletar criativo:', id);
    const criativo = this.criativos.find(i => i.id === id);
    if (!criativo) return;

    this.itemToDelete = criativo;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  async confirmarExclusao(): Promise<void> {
    if (!this.itemToDelete) return;

    console.log('🗑️ Criativos Component - Confirmando exclusão:', this.itemToDelete.id);

    try {
      this.isDeleting = true;
      this.cdr.detectChanges();

      await lastValueFrom(this.criativosService.delete(this.itemToDelete.id));
      
      this.showSuccessMessage('Projeto criativo excluído com sucesso!');
      this.cancelarExclusao();
      await this.carregarCriativos();
      
    } catch (error: any) {
      console.error('❌ Criativos Component - Erro ao excluir:', error);
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

  private async carregarCriativos(): Promise<void> {
    console.log('📥 Criativos Component - Carregando criativos...');
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const criativos$ = this.criativosService.getAll();
      this.criativos = await lastValueFrom(criativos$);
      console.log('✅ Criativos Component - Criativos carregados:', this.criativos.length);
      this.applyFiltersAndPagination();
      
    } catch (error) {
      console.error('❌ Criativos Component - Erro ao carregar criativos:', error);
      this.showErrorMessage('Erro ao carregar projetos. Tente novamente.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ===== MÉTODOS DE FILTRO E PAGINAÇÃO =====

  private applyFiltersAndPagination(): void {
    let result = [...this.criativos];
    
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

    result.sort((a, b) => {
      const dateA = new Date(a.dataCriacao).getTime();
      const dateB = new Date(b.dataCriacao).getTime();
      return this.currentSort === 'recentes' ? dateB - dateA : dateA - dateB;
    });

    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredCriativos = result.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  filterCriativos(filter: 'all' | 'ativo' | 'inativo' | 'excluido'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  searchCriativos(term: string): void {
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
    let result = [...this.criativos];
    
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

  abrirModalNovoCriativos(): void {
    console.log('🆕 Criativos Component - Abrindo modal para novo criativo');
    this.isEditMode = false;
    this.currentCriativosId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.criativosForm = this.createCriativosForm();
    this.showNovoCriativosModal = true;
    this.cdr.detectChanges();
  }

  editarCriativos(id: string): void {
    console.log('✏️ Criativos Component - Editando criativo:', id);
    const criativo = this.criativos.find(i => i.id === id);
    if (!criativo) return;

    this.isEditMode = true;
    this.currentCriativosId = id;
    this.currentImagePreview = this.getImageUrl(criativo.image);
    this.selectedFile = null;

    this.criativosForm = this.createCriativosForm();
    this.criativosForm.patchValue({
      titulo: criativo.titulo,
      cliente: criativo.cliente,
      descricao: criativo.descricao,
      status: criativo.status
    });

    this.showNovoCriativosModal = true;
    this.cdr.detectChanges();
  }

  fecharModalNovoCriativos(): void {
    this.showNovoCriativosModal = false;
    this.isEditMode = false;
    this.currentCriativosId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  verDetalhesCriativos(id: string): void {
    const criativo = this.criativos.find(i => i.id === id);
    if (!criativo) return;

    const detalhes = `
      Detalhes do Projeto Criativo:

      ID: ${criativo.id}
      Título: ${criativo.titulo}
      Cliente: ${criativo.cliente}
      Descrição: ${criativo.descricao}
      Status: ${criativo.status}
      Criado em: ${this.formatDate(criativo.dataCriacao)}
      Atualizado em: ${this.formatDate(criativo.dataAtualizacao)}
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
      return 'Nenhum projeto encontrado';
    }
    if (this.currentFilter !== 'all') {
      return `Nenhum projeto ${this.currentFilter} encontrado`;
    }
    return 'Nenhum projeto cadastrado';
  }

  getEmptyStateDescription(): string {
    if (this.searchTerm) {
      return `Não encontramos projetos que correspondam a "${this.searchTerm}". Tente outros termos de busca.`;
    }
    if (this.currentFilter !== 'all') {
      return `Não há projetos com status "${this.currentFilter}" no momento.`;
    }
    return 'Comece criando seu primeiro projeto criativo.';
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
    alert(message); // Temporário
  }

  private showErrorMessage(message: string): void {
    alert(message); // Temporário
  }
}
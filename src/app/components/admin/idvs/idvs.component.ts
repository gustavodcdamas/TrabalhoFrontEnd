// idv.component.ts - VERSÃO CORRIGIDA E COMPLETA
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IdvService } from '../../../services/idv/idv.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth/auth.service';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMagnifyingGlass, faPen, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';

interface idv {
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
  selector: 'app-idv',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './idvs.component.html',
  styleUrl: './idvs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdvsComponent implements OnInit {
  // Dados
  idv: idv[] = [];
  filteredIdv: idv[] = [];

  // Filtros e busca
  searchTerm: string = '';
  currentFilter: 'all' | 'ativo' | 'inativo' | 'excluido' = 'all';
  currentSort: 'recentes' | 'antigos' = 'recentes';

  // Estados
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  isDeleting: boolean = false;

  // Modal
  showNovoIdvModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  currentIdvId: string | null = null;
  currentImagePreview: string | null = null;
  itemToDelete: idv | null = null;

  // Formulário
  idvForm: FormGroup;
  selectedFile: File | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  // Debug
  showDebugInfo: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private idvService: IdvService,
    library: FaIconLibrary,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular,
      faWhatsapp, faMagnifyingGlass, faPen, faFilter, faTrash
    );
    this.idvForm = this.createIdvForm();
  }

  async ngOnInit(): Promise<void> {
    console.log('🚀 IDV Component - Inicializando...');
    
    if (!this.authService.isLoggedIn()) {
      console.log('❌ IDV Component - Usuário não está logado');
      return;
    }
    
    console.log('✅ IDV Component - Usuário logado:', this.authService.currentUserValue);
    await this.carregarIdvs();
  }

  // ===== MÉTODOS DE FORMULÁRIO =====
  
  createIdvForm(): FormGroup {
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
      return this.idvForm.valid;
    } else {
      return this.idvForm.valid && this.selectedFile !== null;
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.idvForm.controls).forEach(key => {
      const control = this.idvForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.idvForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }

  // ===== MÉTODOS DE ARQUIVO =====

  onFileSelected(event: Event): void {
    console.log('📁 IDV Component - Arquivo selecionado');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validar tamanho do arquivo (5MB)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        console.warn('⚠️ IDV Component - Arquivo muito grande:', this.selectedFile.size);
        alert('Arquivo muito grande. Tamanho máximo: 5MB');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Validar tipo do arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.warn('⚠️ IDV Component - Tipo de arquivo não suportado:', this.selectedFile.type);
        alert('Tipo de arquivo não suportado. Use: JPG, PNG ou WebP');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      console.log('✅ IDV Component - Arquivo válido:', this.selectedFile.name);
      this.idvForm.patchValue({ image: 'arquivo-selecionado' });
      this.idvForm.get('image')?.markAsTouched();
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
    console.log('❌ IDV Component - Erro ao carregar imagem:', event.target.src);
    
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

  async salvarIdv(): Promise<void> {
    console.log('🎯 IDV Component - salvarIdv() iniciado');
    
    try {
      const token = this.authService.token;
      const isLoggedIn = this.authService.isLoggedIn();
      
      console.log('🔍 IDV Component - Verificação antes de salvar:', {
        hasToken: !!token,
        isLoggedIn,
        currentUser: this.authService.currentUserValue
      });
      
      if (!token || !isLoggedIn) {
        console.error('🚨 IDV Component - Usuário não está autenticado!');
        alert('Sessão expirada. Faça login novamente.');
        this.authService.logout();
        return;
      }

      if (!this.isFormValid()) {
        console.log('❌ IDV Component - Formulário inválido');
        this.idvForm.markAllAsTouched();
        this.cdr.detectChanges();
        return;
      }

      this.isSubmitting = true;
      this.cdr.detectChanges();

      const formData = new FormData();
      formData.append('cliente', this.idvForm.value.cliente);
      formData.append('descricao', this.idvForm.value.descricao);
      
      if (this.idvForm.value.titulo) {
        formData.append('titulo', this.idvForm.value.titulo);
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.isEditMode) {
        formData.append('status', this.idvForm.value.status);
      }

      console.log('📦 IDV Component - FormData preparado:', {
        cliente: this.idvForm.value.cliente,
        descricao: this.idvForm.value.descricao,
        titulo: this.idvForm.value.titulo,
        hasImage: !!this.selectedFile,
        isEditMode: this.isEditMode
      });

      let result;
      if (this.isEditMode && this.currentIdvId) {
        console.log('📝 IDV Component - Atualizando IDV existente...');
        result = await lastValueFrom(
          this.idvService.update(this.currentIdvId, formData)
        );
        this.showSuccessMessage('Projeto de identidade visual atualizado com sucesso!');
      } else {
        console.log('📞 IDV Component - Chamando idvService.create()...');
        result = await lastValueFrom(
          this.idvService.create(formData)
        );
        console.log('✅ IDV Component - Resultado recebido:', result);
        this.showSuccessMessage('Projeto de identidade visual criado com sucesso!');
      }

      this.fecharModalNovoIdv();
      await this.carregarIdvs();
      
    } catch (error: any) {
      console.error('❌ IDV Component - Erro ao salvar:', error);
      this.showErrorMessage(this.getErrorMessage(error));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async deletarIdv(id: string): Promise<void> {
    console.log('🗑️ IDV Component - Preparando para deletar IDV:', id);
    const idv = this.idv.find(i => i.id === id);
    if (!idv) return;

    this.itemToDelete = idv;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  async confirmarExclusao(): Promise<void> {
    if (!this.itemToDelete) return;

    console.log('🗑️ IDV Component - Confirmando exclusão:', this.itemToDelete.id);

    try {
      this.isDeleting = true;
      this.cdr.detectChanges();

      await lastValueFrom(this.idvService.delete(this.itemToDelete.id));
      
      this.showSuccessMessage('Projeto de identidade visual excluído com sucesso!');
      this.cancelarExclusao();
      await this.carregarIdvs();
      
    } catch (error: any) {
      console.error('❌ IDV Component - Erro ao excluir:', error);
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

  private async carregarIdvs(): Promise<void> {
    console.log('📥 IDV Component - Carregando IDVs...');
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const idvs$ = this.idvService.getAll();
      this.idv = await lastValueFrom(idvs$);
      console.log('✅ IDV Component - IDVs carregadas:', this.idv.length);
      this.applyFiltersAndPagination();
      
    } catch (error) {
      console.error('❌ IDV Component - Erro ao carregar IDVs:', error);
      this.showErrorMessage('Erro ao carregar projetos. Tente novamente.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ===== MÉTODOS DE FILTRO E PAGINAÇÃO =====

  private applyFiltersAndPagination(): void {
    let result = [...this.idv];
    
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
    this.filteredIdv = result.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  filterIdv(filter: 'all' | 'ativo' | 'inativo' | 'excluido'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  searchIdv(term: string): void {
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
    let result = [...this.idv];
    
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

  abrirModalNovoIdv(): void {
    console.log('🆕 IDV Component - Abrindo modal para novo IDV');
    this.isEditMode = false;
    this.currentIdvId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.idvForm = this.createIdvForm();
    this.showNovoIdvModal = true;
    this.cdr.detectChanges();
  }

  editarIdv(id: string): void {
    console.log('✏️ IDV Component - Editando IDV:', id);
    const idv = this.idv.find(i => i.id === id);
    if (!idv) return;

    this.isEditMode = true;
    this.currentIdvId = id;
    this.currentImagePreview = this.getImageUrl(idv.image);
    this.selectedFile = null;

    this.idvForm = this.createIdvForm();
    this.idvForm.patchValue({
      titulo: idv.titulo,
      cliente: idv.cliente,
      descricao: idv.descricao,
      status: idv.status
    });

    this.showNovoIdvModal = true;
    this.cdr.detectChanges();
  }

  fecharModalNovoIdv(): void {
    this.showNovoIdvModal = false;
    this.isEditMode = false;
    this.currentIdvId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  verDetalhesIdv(id: string): void {
    const idv = this.idv.find(i => i.id === id);
    if (!idv) return;

    const detalhes = `
      Detalhes do Projeto de Identidade Visual:

      ID: ${idv.id}
      Título: ${idv.titulo}
      Cliente: ${idv.cliente}
      Descrição: ${idv.descricao}
      Status: ${idv.status}
      Criado em: ${this.formatDate(idv.dataCriacao)}
      Atualizado em: ${this.formatDate(idv.dataAtualizacao)}
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
    return 'Comece criando seu primeiro projeto de identidade visual.';
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
// landing.component.ts - VERSÃO CORRIGIDA
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { landingService } from '../../../services/landing-page/landing-page.service';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth/auth.service';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faMagnifyingGlass, faPen, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';

interface landing {
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
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  // Dados
  landing: landing[] = [];
  filteredLanding: landing[] = [];

  // Filtros e busca
  searchTerm: string = '';
  currentFilter: 'all' | 'ativo' | 'inativo' | 'excluido' = 'all';
  currentSort: 'recentes' | 'antigos' = 'recentes';

  // Estados
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  isDeleting: boolean = false;

  // Modal
  showNovoLandingModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  currentLandingId: string | null = null;
  currentImagePreview: string | null = null;
  itemToDelete: landing | null = null;

  // Formulário
  landingForm: FormGroup;
  selectedFile: File | null = null;

  // Paginação
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalPages: number = 1;

  // Debug
  showDebugInfo: boolean = false; // Mude para true em desenvolvimento

  constructor(
    private formBuilder: FormBuilder,
    library: FaIconLibrary,
    private landingService: landingService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular,
      faWhatsapp, faMagnifyingGlass, faPen, faFilter, faTrash
    );
    this.landingForm = this.createLandingForm();
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      console.log('❌ Usuário não está logado');
      // Redirecionar para login ou mostrar mensagem
      return;
    }
    
    console.log('✅ Usuário logado:', this.authService.currentUserValue);
    await this.carregarLandingPages();
  }

  // ===== MÉTODOS DE FORMULÁRIO =====
  
  createLandingForm(): FormGroup {
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
      // Em modo edição, imagem é opcional
      return this.landingForm.valid;
    } else {
      // Em modo criação, imagem é obrigatória
      return this.landingForm.valid && this.selectedFile !== null;
    }
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.landingForm.controls).forEach(key => {
      const control = this.landingForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.landingForm.get(controlName);
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
      this.landingForm.patchValue({ image: 'arquivo-selecionado' });
      this.landingForm.get('image')?.markAsTouched();
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

  async salvarLanding(): Promise<void> {
    console.log('🎯 salvarLanding() iniciado');
    
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
        this.landingForm.markAllAsTouched();
        this.cdr.detectChanges();
        return;
      }

      this.isSubmitting = true;
      this.cdr.detectChanges();

      // ✅ PREPARAR FORMDATA
      const formData = new FormData();
      formData.append('cliente', this.landingForm.value.cliente);
      formData.append('descricao', this.landingForm.value.descricao);
      
      if (this.landingForm.value.titulo) {
        formData.append('titulo', this.landingForm.value.titulo);
      }

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.isEditMode) {
        formData.append('status', this.landingForm.value.status);
      }

      console.log('📦 FormData preparado:', {
        cliente: this.landingForm.value.cliente,
        descricao: this.landingForm.value.descricao,
        titulo: this.landingForm.value.titulo,
        hasImage: !!this.selectedFile,
        isEditMode: this.isEditMode
      });

      // ✅ EXECUTAR OPERAÇÃO
      let result;
      if (this.isEditMode && this.currentLandingId) {
        console.log('📝 Atualizando landing page existente...');
        result = await lastValueFrom(
          this.landingService.update(this.currentLandingId, formData)
        );
        this.showSuccessMessage('Landing page atualizada com sucesso!');
      } else {
        console.log('📞 Chamando landingService.create()...');
        result = await lastValueFrom(
          this.landingService.create(formData)
        );
        console.log('✅ Resultado recebido:', result);
        this.showSuccessMessage('Landing page criada com sucesso!');
      }

      // ✅ FINALIZAR
      this.fecharModalNovoLanding();
      await this.carregarLandingPages();
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      this.showErrorMessage(this.getErrorMessage(error));
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  async deletarLanding(id: string): Promise<void> {
    const landing = this.landing.find(i => i.id === id);
    if (!landing) return;

    this.itemToDelete = landing;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  async confirmarExclusao(): Promise<void> {
    if (!this.itemToDelete) return;

    try {
      this.isDeleting = true;
      this.cdr.detectChanges();

      await lastValueFrom(this.landingService.delete(this.itemToDelete.id));
      
      this.showSuccessMessage('Landing page excluída com sucesso!');
      this.cancelarExclusao();
      await this.carregarLandingPages();
      
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

  private async carregarLandingPages(): Promise<void> {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      const landingPages$ = this.landingService.getAll();
      this.landing = await lastValueFrom(landingPages$);
      this.applyFiltersAndPagination();
      
    } catch (error) {
      console.error('Erro ao carregar landing pages:', error);
      this.showErrorMessage('Erro ao carregar projetos. Tente novamente.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ===== MÉTODOS DE FILTRO E PAGINAÇÃO =====

  private applyFiltersAndPagination(): void {
    let result = [...this.landing];
    
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
    this.filteredLanding = result.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  filterLanding(filter: 'all' | 'ativo' | 'inativo' | 'excluido'): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  searchLanding(term: string): void {
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
    let result = [...this.landing];
    
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

  abrirModalNovoLanding(): void {
    this.isEditMode = false;
    this.currentLandingId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.landingForm = this.createLandingForm();
    this.showNovoLandingModal = true;
    this.cdr.detectChanges();
  }

  editarLanding(id: string): void {
    const landing = this.landing.find(i => i.id === id);
    if (!landing) return;

    this.isEditMode = true;
    this.currentLandingId = id;
    this.currentImagePreview = this.getImageUrl(landing.image);
    this.selectedFile = null;

    this.landingForm = this.createLandingForm();
    this.landingForm.patchValue({
      titulo: landing.titulo,
      cliente: landing.cliente,
      descricao: landing.descricao,
      status: landing.status
    });

    this.showNovoLandingModal = true;
    this.cdr.detectChanges();
  }

  fecharModalNovoLanding(): void {
    this.showNovoLandingModal = false;
    this.isEditMode = false;
    this.currentLandingId = null;
    this.currentImagePreview = null;
    this.selectedFile = null;
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  verDetalhesLanding(id: string): void {
    const landing = this.landing.find(i => i.id === id);
    if (!landing) return;

    const detalhes = `
      Detalhes da Landing Page:

      ID: ${landing.id}
      Título: ${landing.titulo}
      Cliente: ${landing.cliente}
      Descrição: ${landing.descricao}
      Status: ${landing.status}
      Criado em: ${this.formatDate(landing.dataCriacao)}
      Atualizado em: ${this.formatDate(landing.dataAtualizacao)}
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
      return 'Nenhuma landing page encontrada';
    }
    if (this.currentFilter !== 'all') {
      return `Nenhuma landing page ${this.currentFilter} encontrada`;
    }
    return 'Nenhuma landing page cadastrada';
  }

  getEmptyStateDescription(): string {
    if (this.searchTerm) {
      return `Não encontramos landing pages que correspondam a "${this.searchTerm}". Tente outros termos de busca.`;
    }
    if (this.currentFilter !== 'all') {
      return `Não há landing pages com status "${this.currentFilter}" no momento.`;
    }
    return 'Comece criando sua primeira landing page.';
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
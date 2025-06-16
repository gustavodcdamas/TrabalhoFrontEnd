import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEye, faFilter, faMagnifyingGlass, faPen, faTrash, faUsers, faRefresh, faSpinner, faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';
import { User, UserRole } from '../../../models/user.model';
import { 
  Cliente, 
  ClientesService, 
  CreateClienteDto, 
  UpdateClienteDto 
} from '../../../services/cliente/cliente.service';

import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ClientesComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  loading = false;
  error: string | null = null;

  clienteForm!: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  currentClienteId: string | null = null;
  currentUser: User | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private library: FaIconLibrary,
    private clientesService: ClientesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupForm();
    this.setupIcons();
    this.setupSearch();
  }

  ngOnInit(): void {
    console.log('🚀 [Component] Iniciando componente clientes');
    this.loadCurrentUser();
    this.loadClientes();
    this.subscribeToClientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupForm(): void {
    this.clienteForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
    });
  }

  private setupIcons(): void {
    this.library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular, faWhatsapp,
      faMagnifyingGlass, faPen, faFilter, faTrash, faUsers, faEye,
      faRefresh, faSpinner, faExclamationTriangle, faUser
    );
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  private loadCurrentUser(): void {
    console.log('👤 [Component] Carregando usuário atual...');
    
    if (this.authService.currentUserValue) {
      console.log('✅ [Component] Usuário via currentUserValue:', this.authService.currentUserValue);
      this.currentUser = this.authService.currentUserValue;
      this.cdr.detectChanges();
      return;
    }

    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('✅ [Component] Usuário via Observable:', user);
          this.currentUser = user;
          this.cdr.detectChanges();
        } else {
          console.warn('⚠️ [Component] Nenhum usuário logado, usando fallback');
          this.setFallbackUser();
        }
      });
  }

  private setFallbackUser(): void {
    console.warn('🔄 [Component] Usando usuário fallback para desenvolvimento');
    this.currentUser = {
      id: '1',
      email: 'admin@test.com',
      role: UserRole.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      username: 'superadmin',
      cpf: '',
      isSuperAdmin: true,
      isAdmin: true,
      isClient: false,
      token: 'fallback-token'
    };
    this.cdr.detectChanges();
  }

  private subscribeToClientes(): void {
    this.clientesService.clientes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(clientes => {
        console.log('📋 [Component] Clientes recebidos:', clientes);
        this.clientes = clientes;
        this.applyFilters();
        this.cdr.detectChanges();
      });

    this.clientesService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.detectChanges();
      });
  }

  loadClientes(): void {
    console.log('📥 [Component] Carregando clientes...');
    this.clientesService.loadClientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ [Component] Clientes carregados');
          this.error = null;
        },
        error: (error: any) => {
          console.error('❌ [Component] Erro ao carregar:', error);
          this.error = 'Erro ao carregar clientes';
          this.cdr.detectChanges();
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string): void {
    if (!term.trim()) {
      this.filteredClientes = [...this.clientes];
    } else {
      const searchTerm = term.toLowerCase().trim();
      this.filteredClientes = this.clientes.filter(cliente =>
        this.getFullName(cliente).toLowerCase().includes(searchTerm) ||
        cliente.email.toLowerCase().includes(searchTerm) ||
        (cliente.telefone && cliente.telefone.toLowerCase().includes(searchTerm))
      );
    }
    this.currentPage = 1;
    this.calculateTotalPages();
    this.cdr.detectChanges();
  }

  private applyFilters(): void {
    this.performSearch(this.searchTerm);
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredClientes.length / this.itemsPerPage);
  }

  getPaginatedClientes(): Cliente[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredClientes.slice(startIndex, endIndex);
  }

  getFullName(cliente: Cliente): string {
    return `${cliente.firstName} ${cliente.lastName}`.trim();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentClienteId = null;
    this.clienteForm.reset();
    
    this.clienteForm.get('password')?.setValidators([
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.clienteForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  openEditModal(cliente: Cliente): void {
    this.isEditing = true;
    this.currentClienteId = cliente.id;
    
    this.clienteForm.setValue({
      firstName: cliente.firstName,
      lastName: cliente.lastName,
      email: cliente.email,
      telefone: cliente.telefone || '',
      password: ''
    });

    this.clienteForm.get('password')?.setValidators([
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.clienteForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.clienteForm.reset();
    this.error = null;
  }

  saveCliente(): void {
    console.log('🚀 [Component] ==================== INÍCIO saveCliente ====================');
    console.log('📝 [Component] Formulário válido:', this.clienteForm.valid);
    console.log('📝 [Component] isEditing:', this.isEditing);
    console.log('📝 [Component] currentClienteId:', this.currentClienteId);
    
    if (this.clienteForm.invalid) {
      console.log('❌ [Component] Formulário inválido, marcando campos como touched');
      this.markFormGroupTouched(this.clienteForm);
      return;
    }

    this.loading = true;
    const formValues = this.clienteForm.value;

    // ✅ VALIDAÇÃO ESPECÍFICA DO TELEFONE
    if (formValues.telefone && formValues.telefone.trim()) {
      const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!telefoneRegex.test(formValues.telefone.trim())) {
        console.error('❌ [Component] Formato de telefone inválido:', formValues.telefone);
        this.error = 'Formato de telefone inválido. Use: (00) 00000-0000';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.isEditing && this.currentClienteId) {
      console.log('🔄 [Component] Modo EDIÇÃO - Atualizando cliente');
      console.log('📋 [Component] Valores do formulário:', JSON.stringify(formValues, null, 2));
      
      const updateData: UpdateClienteDto = {
        firstName: formValues.firstName?.trim(),
        lastName: formValues.lastName?.trim(),
        email: formValues.email?.trim()
      };

      // ✅ TELEFONE: só incluir se preenchido e válido
      if (formValues.telefone && formValues.telefone.trim()) {
        updateData.telefone = formValues.telefone.trim();
      }

      // ✅ SENHA: só incluir se preenchida
      if (formValues.password && formValues.password.trim()) {
        updateData.password = formValues.password.trim();
        console.log('🔐 [Component] Incluindo senha na atualização');
      }

      console.log('📤 [Component] Dados finais para envio:', JSON.stringify(updateData, null, 2));

      this.clientesService.updateCliente(this.currentClienteId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('✅ [Component] Cliente atualizado com sucesso');
            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('❌ [Component] Erro ao atualizar cliente:', error);
            
            if (error.error && error.error.message) {
              if (Array.isArray(error.error.message)) {
                this.error = error.error.message.join(', ');
              } else {
                this.error = error.error.message;
              }
            } else {
              this.error = 'Erro ao atualizar cliente';
            }
            
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      console.log('📝 [Component] Modo CRIAÇÃO - Criando novo cliente');
      console.log('📋 [Component] Valores do formulário para criação:', JSON.stringify(formValues, null, 2));
      
      const createData: CreateClienteDto = {
        firstName: formValues.firstName?.trim(),
        lastName: formValues.lastName?.trim(),
        email: formValues.email?.trim(),
        password: formValues.password?.trim(),
        isClient: true
      };

      // ✅ TELEFONE: só incluir se preenchido e válido
      if (formValues.telefone && formValues.telefone.trim()) {
        createData.telefone = formValues.telefone.trim();
      }

      console.log('📤 [Component] Dados para criação:', JSON.stringify(createData, null, 2));

      this.clientesService.createCliente(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('✅ [Component] Cliente criado:', JSON.stringify(result, null, 2));
            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('❌ [Component] Erro ao criar cliente:', error);
            
            if (error.error && error.error.message) {
              if (Array.isArray(error.error.message)) {
                this.error = error.error.message.join(', ');
              } else {
                this.error = error.error.message;
              }
            } else {
              this.error = 'Erro ao criar cliente';
            }
            
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
    
    console.log('🏁 [Component] ==================== FIM saveCliente ====================');
  }
  
  deleteCliente(cliente: Cliente): void {
    const confirmMessage = `Tem certeza que deseja excluir o cliente ${this.getFullName(cliente)}?`;
    if (confirm(confirmMessage)) {
      this.clientesService.deleteCliente(cliente.email)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Atualização automática via observable
          },
          error: (error: any) => {
            this.error = 'Erro ao excluir cliente';
            this.cdr.detectChanges();
          }
        });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getPages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  refreshData(): void {
    this.clientesService.invalidateCache();
    this.loadClientes();
  }

  getStatusBadgeClass(cliente: Cliente): string {
    return cliente.isEmailVerified ? 'status-active' : 'status-inactive';
  }

  getStatusText(cliente: Cliente): string {
    return cliente.isEmailVerified ? 'Verificado' : 'Não Verificado';
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      let formattedValue = '';
      if (value.length >= 2) {
        formattedValue = `(${value.substring(0, 2)})`;
        if (value.length > 2) {
          formattedValue += ` ${value.substring(2, 7)}`;
          if (value.length > 7) {
            formattedValue += `-${value.substring(7, 11)}`;
          }
        }
      } else {
        formattedValue = value;
      }
      
      this.clienteForm.patchValue({
        telefone: formattedValue
      }, { emitEvent: false });
    }
  }

  get Math() {
    return Math;
  }
}
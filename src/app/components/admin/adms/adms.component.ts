import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEye, faFilter, faMagnifyingGlass, faPen, faTrash, faUserShield, faRefresh, faSpinner, faExclamationTriangle, faCrown } from '@fortawesome/free-solid-svg-icons';
import { User, UserRole } from '../../../models/user.model';
// ✅ IMPORT CORRIGIDO
import { 
  Administrator, 
  AdministratorService, 
  CreateAdminDto, 
  UpdateAdminDto 
} from '../../../services/admin/administrator.service';

import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-adms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './adms.component.html',
  styleUrl: './adms.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class admsComponent implements OnInit, OnDestroy {
  administrators: Administrator[] = [];
  filteredAdministrators: Administrator[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  loading = false;
  error: string | null = null;

  adminForm!: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  currentAdminId: string | null = null;
  currentUser: User | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private library: FaIconLibrary,
    private administratorService: AdministratorService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupForm();
    this.setupIcons();
    this.setupSearch();
  }

  ngOnInit(): void {
    console.log('🚀 [Component] Iniciando componente adms');
    this.loadCurrentUser();
    this.loadAdministrators();
    this.subscribeToAdministrators();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupForm(): void {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      // ✅ CORRIGIDO: Configurar disabled no FormControl
      role: [{ value: 'admin', disabled: false }, Validators.required]
    });
  }

  private setupIcons(): void {
    this.library.addIcons(
      faFacebook, faLinkedinIn, faInstagram, faAngular, faWhatsapp,
      faMagnifyingGlass, faPen, faFilter, faTrash, faUserShield, faEye,
      faRefresh, faSpinner, faExclamationTriangle, faCrown
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

  // ✅ MÉTODO SIMPLIFICADO QUE FUNCIONA COM QUALQUER AuthService
  private loadCurrentUser(): void {
    console.log('👤 [Component] Carregando usuário atual...');
    
    // ✅ CORRIGIDO: Usar currentUserValue em vez de currentUser
    if (this.authService.currentUserValue) {
      console.log('✅ [Component] Usuário via currentUserValue:', this.authService.currentUserValue);
      this.currentUser = this.authService.currentUserValue;
      this.cdr.detectChanges();
      return;
    }

    // ✅ ALTERNATIVA: Se currentUserValue não estiver disponível, se inscrever no Observable
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

  private subscribeToAdministrators(): void {
    this.administratorService.administrators$
      .pipe(takeUntil(this.destroy$))
      .subscribe(admins => {
        console.log('📋 [Component] Administradores recebidos:', admins);
        this.administrators = admins;
        this.applyFilters();
        this.cdr.detectChanges();
      });

    this.administratorService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.detectChanges();
      });
  }

  loadAdministrators(): void {
    console.log('📥 [Component] Carregando administradores...');
    this.administratorService.loadAdministrators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ [Component] Administradores carregados');
          this.error = null;
        },
        error: (error: any) => {
          console.error('❌ [Component] Erro ao carregar:', error);
          this.error = 'Erro ao carregar administradores';
          this.cdr.detectChanges();
        }
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string): void {
    if (!term.trim()) {
      this.filteredAdministrators = [...this.administrators];
    } else {
      const searchTerm = term.toLowerCase().trim();
      this.filteredAdministrators = this.administrators.filter(admin =>
        this.getFullName(admin).toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm) ||
        admin.role.toLowerCase().includes(searchTerm)
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
    this.totalPages = Math.ceil(this.filteredAdministrators.length / this.itemsPerPage);
  }

  getPaginatedAdministrators(): Administrator[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAdministrators.slice(startIndex, endIndex);
  }

  getFullName(admin: Administrator): string {
    return `${admin.firstName} ${admin.lastName}`.trim();
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrador';
      default: return role;
    }
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentAdminId = null;
    this.adminForm.reset({ role: 'admin' });
    
    // ✅ CORRIGIDO: Habilitar role para novo admin
    this.adminForm.get('role')?.enable();
    
    this.adminForm.get('password')?.setValidators([
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.adminForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  openEditModal(admin: Administrator): void {
    if (!this.canEditAdmin(admin.role)) {
      alert('Você não tem permissão para editar este administrador.');
      return;
    }

    this.isEditing = true;
    this.currentAdminId = admin.id;
    
    this.adminForm.setValue({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: '',
      role: admin.role
    });

    // ✅ CORRIGIDO: Configurar disabled programaticamente
    const roleControl = this.adminForm.get('role');
    if (admin.role === 'super_admin') {
      roleControl?.disable(); // Desabilitar se for super_admin
    } else {
      roleControl?.enable();  // Habilitar para admin comum
    }

    this.adminForm.get('password')?.setValidators([
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.adminForm.get('password')?.updateValueAndValidity();
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.adminForm.reset();
    this.error = null;
  }

  // ✅ MÉTODO saveAdministrator COMPLETAMENTE CORRIGIDO
  saveAdministrator(): void {
    console.log('🚀 [Component] ==================== INÍCIO saveAdministrator ====================');
    console.log('📝 [Component] Formulário válido:', this.adminForm.valid);
    console.log('📝 [Component] Formulário errors:', this.adminForm.errors);
    console.log('📝 [Component] isEditing:', this.isEditing);
    console.log('📝 [Component] currentAdminId:', this.currentAdminId);
    
    if (this.adminForm.invalid) {
      console.log('❌ [Component] Formulário inválido, marcando campos como touched');
      this.markFormGroupTouched(this.adminForm);
      return;
    }

    this.loading = true;

    if (this.isEditing && this.currentAdminId) {
      console.log('🔄 [Component] Modo EDIÇÃO - Atualizando administrador');
      
      // ✅ USAR getRawValue() para incluir campos desabilitados
      const formValues = this.adminForm.getRawValue();
      console.log('📋 [Component] Valores RAW do formulário:', JSON.stringify(formValues, null, 2));
      
      const updateData: UpdateAdminDto = {
        firstName: formValues.firstName?.trim(),
        lastName: formValues.lastName?.trim(),
        email: formValues.email?.trim()
      };

      // ✅ IMPORTANTE: Só incluir senha se foi fornecida
      if (formValues.password && formValues.password.trim()) {
        updateData.password = formValues.password.trim();
        console.log('🔐 [Component] Incluindo senha na atualização');
      }

      // ✅ SEMPRE INCLUIR ROLE (mesmo se for o mesmo)
      if (formValues.role) {
        updateData.role = formValues.role;
        console.log('👑 [Component] Incluindo role:', formValues.role);
      }

      console.log('📤 [Component] Dados finais para envio:', JSON.stringify(updateData, null, 2));

      this.administratorService.updateAdministrator(this.currentAdminId, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('✅ [Component] Resposta do servidor:', JSON.stringify(result, null, 2));
            console.log('✅ [Component] Administrador atualizado com sucesso');
            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('❌ [Component] Erro ao atualizar administrador:', error);
            console.error('❌ [Component] Error details:', JSON.stringify(error, null, 2));
            
            // ✅ MELHOR TRATAMENTO DE ERRO
            if (error.error && error.error.message) {
              if (Array.isArray(error.error.message)) {
                this.error = error.error.message.join(', ');
              } else {
                this.error = error.error.message;
              }
            } else {
              this.error = 'Erro ao atualizar administrador';
            }
            
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      console.log('📝 [Component] Modo CRIAÇÃO - Criando novo administrador');
      
      const formValues = this.adminForm.value;
      console.log('📋 [Component] Valores do formulário para criação:', JSON.stringify(formValues, null, 2));
      
      const createData: CreateAdminDto = {
        firstName: formValues.firstName?.trim(),
        lastName: formValues.lastName?.trim(),
        email: formValues.email?.trim(),
        password: formValues.password?.trim(),
        isAdmin: true
      };

      console.log('📤 [Component] Dados para criação:', JSON.stringify(createData, null, 2));

      this.administratorService.createAdministrator(createData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('✅ [Component] Administrador criado:', JSON.stringify(result, null, 2));
            this.closeModal();
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('❌ [Component] Erro ao criar administrador:', error);
            this.error = 'Erro ao criar administrador';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
    
    console.log('🏁 [Component] ==================== FIM saveAdministrator ====================');
  }
  
  deleteAdministrator(admin: Administrator): void {
    if (!this.canDeleteAdmin(admin.role)) {
      alert('Você não tem permissão para excluir este administrador.');
      return;
    }

    const confirmMessage = `Tem certeza que deseja excluir o administrador ${this.getFullName(admin)}?`;
    if (confirm(confirmMessage)) {
      this.administratorService.deleteAdministrator(admin.email)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Atualização automática via observable
          },
          error: (error: any) => {
            this.error = 'Erro ao excluir administrador';
            this.cdr.detectChanges();
          }
        });
    }
  }

  canEditAdmin(targetRole: string): boolean {
    return this.administratorService.canEditAdmin(this.currentUser?.role, targetRole);
  }

  canDeleteAdmin(targetRole: string): boolean {
    return this.administratorService.canDeleteAdmin(this.currentUser?.role, targetRole);
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
    this.administratorService.invalidateCache();
    this.loadAdministrators();
  }

  getStatusBadgeClass(admin: Administrator): string {
    return admin.isEmailVerified ? 'status-active' : 'status-inactive';
  }

  getStatusText(admin: Administrator): string {
    return admin.isEmailVerified ? 'Verificado' : 'Não Verificado';
  }

  get Math() {
    return Math;
  }

  // ✅ MÉTODOS DE DEBUG (TEMPORÁRIOS)
  testEndpoint(): void {
    console.log('🧪 [Component] Testando se endpoints existem...');
    
    this.administratorService.testEndpoint().subscribe({
      next: (response) => {
        console.log('✅ [Component] Teste de endpoint bem-sucedido:', response);
        alert('✅ Endpoint de teste funcionou! Verifique o console para detalhes.');
      },
      error: (error) => {
        console.error('❌ [Component] Teste de endpoint falhou:', error);
        alert('❌ Endpoint de teste falhou! Verifique o console para detalhes.');
      }
    });
  }

  testUpdateAdmin(): void {
    if (!this.administrators.length) {
      alert('Nenhum administrador disponível para teste');
      return;
    }

    const firstAdmin = this.administrators[0];
    console.log('🧪 [Component] Testando atualização do primeiro admin:', firstAdmin);

    const testData = {
      firstName: firstAdmin.firstName,
      lastName: firstAdmin.lastName,
      email: firstAdmin.email,
      role: 'super_admin' // ✅ Tentando mudar para super_admin
    };

    console.log('📤 [Component] Dados de teste:', testData);

    this.administratorService.updateAdministrator(firstAdmin.id, testData).subscribe({
      next: (result) => {
        console.log('✅ [Component] Teste de atualização bem-sucedido:', result);
        alert('✅ Teste de atualização funcionou! Verifique o console.');
      },
      error: (error) => {
        console.error('❌ [Component] Teste de atualização falhou:', error);
        alert('❌ Teste de atualização falhou! Verifique o console.');
      }
    });
  }

  debugFormValues(): void {
    console.log('🔍 [Component] DEBUG - Estado atual do formulário:');
    console.log('📝 Form valid:', this.adminForm.valid);
    console.log('📝 Form value:', this.adminForm.value);
    console.log('📝 Form getRawValue:', this.adminForm.getRawValue());
    console.log('📝 Role control value:', this.adminForm.get('role')?.value);
    console.log('📝 Role control enabled:', this.adminForm.get('role')?.enabled);
    console.log('📝 Role control disabled:', this.adminForm.get('role')?.disabled);
    
    // ✅ TESTE: Forçar um valor no role
    this.adminForm.get('role')?.setValue('super_admin');
    console.log('📝 Após forçar super_admin:', this.adminForm.get('role')?.value);
  }

}
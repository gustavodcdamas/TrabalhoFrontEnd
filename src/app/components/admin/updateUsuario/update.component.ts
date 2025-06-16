import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CepService } from '../../../services/cep/cep.service';
import { UserService } from '../../../services/user/user.service';
import { cpfValidator, formatCpf } from './cpf.validator';
import { User } from '../../../models/user.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

// ✅ INTERFACE PARA RESPOSTA DO UPDATE
interface UpdateUserResponse {
  message: string;
  user: User;
}

@Component({
  selector: 'app-update',
  imports: [ReactiveFormsModule, HeaderComponent, CommonModule, FooterComponent, FormsModule],
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})

export class UpdateComponent implements OnInit {
  updateForm!: FormGroup;
  loading = false;
  deleting = false;
  error = '';
  successMessage = '';
  userId: string = '';
  
  // Modal de confirmação
  showDeleteModal = false;
  confirmEmailInput = '';

  constructor(
    private fb: FormBuilder,
    private cepService: CepService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // ✅ ADICIONAR CHANGE DETECTOR
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser || !currentUser.id) {
      console.log('❌ Usuário não autenticado, redirecionando...');
      this.router.navigate(['/login']);
      return;
    }

    this.userId = currentUser.id;
    
    console.log('🔍 Usuário autenticado:', {
      id: this.userId,
      email: currentUser.email,
      token: !!currentUser.token
    });

    this.initForm();
    this.loadUserData();
    this.setupCepListener();
  }

  // ✅ FORMULÁRIO COM VALIDAÇÃO MAIS FLEXÍVEL
  initForm(): void {
    this.updateForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      username: [''],
      cpf: ['', [cpfValidator]], // ✅ Apenas validator de formato, sem obrigatório
      cep: ['', []],
      logradouro: [{value: '', disabled: true}],
      bairro: [{value: '', disabled: true}],
      cidade: [{value: '', disabled: true}],
      estado: [{value: '', disabled: true}],
      numero: [''],
      complemento: ['']
    });
  }

  loadUserData(): void {
    console.log('🔍 Carregando dados do usuário:', this.userId);
    
    this.userService.getUserById(this.userId).subscribe({
      next: (user: User | null) => {
        console.log('👤 Dados do usuário carregados:', user);
        
        if (user) {
          this.userId = user.id;
          
          // ✅ FORMATAR CPF CORRETAMENTE AO CARREGAR
          const cpfFormatted = user.cpf ? formatCpf(user.cpf) : '';
          
          this.updateForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username || '',
            cpf: cpfFormatted, // ✅ CPF formatado
            cep: user.address?.cep || '',
            logradouro: user.address?.logradouro || '',
            bairro: user.address?.bairro || '',
            cidade: user.address?.cidade || '',
            estado: user.address?.estado || '',
            numero: user.address?.numero || '',
            complemento: user.address?.complemento || ''
          });
          
          console.log('✅ Formulário preenchido com sucesso');
          console.log('📋 CPF carregado:', cpfFormatted);
        } else {
          console.log('❌ Usuário não encontrado');
          this.error = 'Usuário não encontrado';
        }
      },
      error: (err) => {
        console.error('❌ Erro ao carregar dados do usuário:', err);
        
        if (err.status === 400) {
          console.log('🔄 Erro 400 detectado, limpando autenticação...');
          this.error = 'Dados de autenticação inconsistentes. Redirecionando...';
          
          setTimeout(() => {
            this.clearAuthAndReload();
          }, 2000);
        } else {
          this.error = 'Erro ao carregar dados do usuário';
        }
      }
    });
  }
  
  setupCepListener(): void {
    const cepControl = this.updateForm.get('cep');
    if (cepControl) {
      cepControl.valueChanges.subscribe(cep => {
        console.log('🔍 CEP digitado:', cep);
        
        if (cep) {
          // Limpar formatação do CEP
          const cepLimpo = cep.replace(/\D/g, '');
          console.log('🧹 CEP limpo:', cepLimpo);
          console.log('📏 Tamanho do CEP:', cepLimpo.length);
          
          if (cepLimpo.length === 8) {
            console.log('✅ CEP tem 8 dígitos, buscando endereço...');
            this.buscarCep(cepLimpo);
          } else {
            console.log('⚠️ CEP não tem 8 dígitos ainda');
            // Limpar campos de endereço se CEP incompleto
            this.limparEndereco();
          }
        } else {
          console.log('⚠️ CEP vazio, limpando endereço');
          this.limparEndereco();
        }
      });
    }
  }

  buscarCep(cep?: string): void {
    const cepControl = this.updateForm.get('cep');
    if (!cepControl) {
      console.error('❌ Controle CEP não encontrado');
      return;
    }

    // Usar CEP passado como parâmetro ou pegar do formulário
    const cepParaBuscar = cep || cepControl.value?.replace(/\D/g, '');
    
    console.log('🔍 Buscando CEP:', cepParaBuscar);
    
    if (!cepParaBuscar || cepParaBuscar.length !== 8) {
      console.log('❌ CEP inválido para busca:', cepParaBuscar);
      cepControl.setErrors({ invalidCep: true });
      return;
    }

    // Mostrar loading visual (opcional)
    console.log('⏳ Iniciando busca do CEP...');
    
    this.cepService.getEnderecoByCep(cepParaBuscar).subscribe({
      next: (response) => {
        console.log('✅ Resposta da API ViaCEP:', response);
        
        // Verificar se o CEP foi encontrado (ViaCEP retorna erro: true quando não encontra)
        if (response.erro) {
          console.log('❌ CEP não encontrado na API');
          cepControl.setErrors({ invalidCep: true });
          this.limparEndereco();
          return;
        }
        
        // CEP válido, preencher campos
        console.log('🏠 Preenchendo endereço automaticamente...');
        this.updateForm.patchValue({
          logradouro: response.logradouro || '',
          bairro: response.bairro || '',
          cidade: response.localidade || '', // ⚠️ ViaCEP usa 'localidade', não 'cidade'
          estado: response.uf || ''
        });
        
        // Remover erro de CEP se existir
        cepControl.setErrors(null);
        console.log('✅ Endereço preenchido com sucesso');
      },
      error: (err) => {
        console.error('❌ Erro na API ViaCEP:', err);
        cepControl.setErrors({ invalidCep: true });
        this.limparEndereco();
      }
    });
  }

  limparEndereco(): void {
    console.log('🧹 Limpando campos de endereço...');
    this.updateForm.patchValue({
      logradouro: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
  }

  formatCpf(): void {
    const cpfControl = this.updateForm.get('cpf');
    if (!cpfControl || !cpfControl.value) return;

    const formatted = formatCpf(cpfControl.value);
    cpfControl.setValue(formatted, { emitEvent: false });
    
    // ✅ VALIDAR CPF EM TEMPO REAL
    console.log('🔍 Validando CPF:', formatted);
    const isValid = cpfValidator(cpfControl);
    console.log('📊 Resultado validação CPF:', isValid === null ? 'válido' : 'inválido');
  }

  cepValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value || !control.value.trim()) {
      console.log('🔍 CEP vazio - considerado válido (opcional)');
      return null; // Campo vazio é válido (opcional)
    }
    
    const cep = control.value.replace(/\D/g, '');
    console.log('🔍 Validando CEP:', {
      original: control.value,
      limpo: cep,
      tamanho: cep.length
    });
    
    if (cep.length !== 8) {
      console.log('❌ CEP inválido - não tem 8 dígitos');
      return { invalidCep: true };
    }
    
    console.log('✅ CEP válido');
    return null;
  }

  formatCep(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Limitar a 8 dígitos
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    // Aplicar formatação XXXXX-XXX
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
    }
    
    // Atualizar o campo
    input.value = value;
    this.updateForm.get('cep')?.setValue(value, { emitEvent: true });
    
    console.log('📝 CEP formatado:', value);
  }

  // ✅ ONSUBMIT COM FORÇAR DETECÇÃO DE MUDANÇA
  onSubmit(): void {
    console.log('🚀 onSubmit() iniciado');
    console.log('📊 Estado inicial - loading:', this.loading);
    
    // ✅ RESETAR ESTADOS EXPLICITAMENTE
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    
    console.log('📊 Após reset - loading:', this.loading);
    
    // ✅ FORÇAR DETECÇÃO DE MUDANÇA
    this.cdr.detectChanges();
    
    console.log('📤 Iniciando atualização...');

    // ✅ PREPARAR DADOS APENAS COM CAMPOS PREENCHIDOS
    const formValues = this.updateForm.getRawValue();
    console.log('📋 Valores do formulário (raw):', formValues);

    const updateData: any = {};

    // Campos básicos
    if (formValues.firstName?.trim()) {
      updateData.firstName = formValues.firstName.trim();
      console.log('✅ firstName adicionado:', updateData.firstName);
    }
    if (formValues.lastName?.trim()) {
      updateData.lastName = formValues.lastName.trim();
      console.log('✅ lastName adicionado:', updateData.lastName);
    }
    if (formValues.username?.trim()) {
      updateData.username = formValues.username.trim();
      console.log('✅ username adicionado:', updateData.username);
    }
    
    // ✅ CPF - enviar apenas números se válido
    if (formValues.cpf?.trim()) {
      const cpfControl = this.updateForm.get('cpf');
      const cpfErrors = cpfValidator(cpfControl!);
      
      console.log('🔍 Validação CPF:', {
        valorOriginal: formValues.cpf,
        aposLimpeza: formValues.cpf.replace(/\D/g, ''),
        temErros: cpfErrors !== null,
        erros: cpfErrors
      });
      
      if (cpfErrors === null) {
        updateData.cpf = formValues.cpf.replace(/\D/g, '');
        console.log('✅ CPF válido para envio:', updateData.cpf);
      } else {
        this.loading = false;
        this.error = 'CPF inválido. Corrija antes de continuar.';
        this.cdr.detectChanges(); // ✅ FORÇAR ATUALIZAÇÃO
        console.error('❌ CPF inválido:', cpfErrors);
        return;
      }
    }

    // ✅ ENDEREÇO - incluir apenas se CEP estiver preenchido
    if (formValues.cep?.trim()) {
      const cep = formValues.cep.replace(/\D/g, '');
      console.log('🏠 Processando endereço - CEP:', cep);
      
      if (cep.length === 8) {
        updateData.address = {
          cep: cep,
          logradouro: formValues.logradouro?.trim() || '',
          bairro: formValues.bairro?.trim() || '',
          cidade: formValues.cidade?.trim() || '',
          estado: formValues.estado?.trim() || '',
          numero: formValues.numero?.trim() || '',
          complemento: formValues.complemento?.trim() || ''
        };
        console.log('✅ Endereço adicionado:', updateData.address);
      } else {
        this.loading = false;
        this.error = 'CEP inválido. Deve ter 8 dígitos.';
        this.cdr.detectChanges(); // ✅ FORÇAR ATUALIZAÇÃO
        console.error('❌ CEP inválido:', cep);
        return;
      }
    }

    // ✅ VERIFICAR SE HÁ DADOS PARA ATUALIZAR
    if (Object.keys(updateData).length === 0) {
      this.loading = false;
      this.error = 'Preencha pelo menos um campo para atualizar.';
      this.cdr.detectChanges(); // ✅ FORÇAR ATUALIZAÇÃO
      console.warn('⚠️ Nenhum dado para atualizar');
      return;
    }

    // ✅ LOG COMPLETO DOS DADOS FINAIS
    console.log('📦 DADOS FINAIS PARA ENVIO:', {
      dadosCompletos: updateData,
      tamanhoObjeto: Object.keys(updateData).length,
      camposIncluidos: Object.keys(updateData),
      userId: this.userId,
      stringifyDados: JSON.stringify(updateData, null, 2)
    });

    // ✅ ENVIAR ATUALIZAÇÃO COM LOGS DETALHADOS
    console.log('🚀 Iniciando requisição HTTP PATCH...');
    console.log('🔗 URL:', `${environment.apiUrl}/api/users/${this.userId}`);
    
    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (response: any) => {
        console.log('🎉 SUCESSO - Callback next() executado');
        console.log('📊 Estado antes de resetar loading:', this.loading);
        console.log('🎉 SUCESSO - Resposta completa:', response);
        
        // ✅ RESETAR LOADING DE FORMA EXPLÍCITA
        this.loading = false;
        console.log('📊 Loading resetado para:', this.loading);
        
        // ✅ DEFINIR MENSAGEM DE SUCESSO
        this.successMessage = '🎉 Dados atualizados com sucesso!';
        console.log('✅ Mensagem de sucesso definida:', this.successMessage);
        
        // ✅ FORÇAR DETECÇÃO DE MUDANÇA IMEDIATAMENTE
        this.cdr.detectChanges();
        console.log('🔄 Change detection forçada');
        
        // ✅ ATUALIZAR DADOS LOCAIS
        let updatedUserData: User | null = null;
        
        if (response && typeof response === 'object') {
          if (response.user) {
            updatedUserData = response.user;
            console.log('📦 Usuário extraído de response.user:', updatedUserData);
          } else if (response.id && response.email) {
            updatedUserData = response;
            console.log('📦 Resposta é diretamente o usuário:', updatedUserData);
          }
        }
        
        if (updatedUserData) {
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            const mergedUser = { ...currentUser, ...updatedUserData };
            localStorage.setItem('currentUser', JSON.stringify(mergedUser));
            console.log('🔄 Dados locais atualizados:', mergedUser);
          }
        } else {
          console.log('⚠️ Dados do usuário não encontrados na resposta');
        }
        
        // ✅ RECARREGAR DADOS DO FORMULÁRIO APÓS 1 SEGUNDO
        setTimeout(() => {
          this.loadUserData();
          console.log('🔄 Dados do formulário recarregados');
        }, 1000);
        
        // ✅ LIMPAR MENSAGEM DE SUCESSO APÓS 4 SEGUNDOS
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
          console.log('🧹 Mensagem de sucesso limpa');
        }, 4000);
      },
      error: (err) => {
        console.error('💥 ERRO - Callback error() executado');
        console.error('📊 Estado antes de resetar loading:', this.loading);
        console.error('💥 ERRO COMPLETO:', err);
        
        // ✅ RESETAR LOADING DE FORMA EXPLÍCITA
        this.loading = false;
        console.log('❌ Loading resetado para:', this.loading);
        
        // ✅ LOG DETALHADO DO ERRO
        if (err.error) {
          console.error('📝 Mensagem do erro:', err.error.message);
          console.error('🏷️ Tipo do erro:', typeof err.error.message);
          
          // Se a mensagem é um array, mostrar cada item
          if (Array.isArray(err.error.message)) {
            console.error('📋 Erros de validação:');
            err.error.message.forEach((msg: string, index: number) => {
              console.error(`  ${index + 1}. ${msg}`);
            });
          }
        }
        
        if (err.status === 400) {
          // ✅ TRATAMENTO ESPECÍFICO PARA ERRO 400
          let errorMsg = 'Dados inválidos.';
          
          if (err.error?.message) {
            if (Array.isArray(err.error.message)) {
              // Se for array de erros de validação
              errorMsg = 'Erros de validação: ' + err.error.message.join(', ');
            } else if (typeof err.error.message === 'string') {
              errorMsg = err.error.message;
            }
          }
          
          this.error = errorMsg;
          console.error('❌ Erro 400 tratado:', errorMsg);
        } else if (err.status === 401) {
          this.error = 'Sessão expirada. Redirecionando...';
          setTimeout(() => this.clearAuthAndReload(), 2000);
        } else {
          this.error = err.error?.message || 'Erro ao atualizar. Tente novamente.';
        }
        
        // ✅ FORÇAR DETECÇÃO DE MUDANÇA IMEDIATAMENTE
        this.cdr.detectChanges();
        console.log('🔄 Change detection forçada após erro');
        
        // ✅ LIMPAR ERRO APÓS 5 SEGUNDOS
        setTimeout(() => {
          this.error = '';
          this.cdr.detectChanges();
          console.log('🧹 Mensagem de erro limpa');
        }, 5000);
      }
    });
  }

  // Resto dos métodos iguais...
  testFormData(): void {
    const formValues = this.updateForm.getRawValue();
    const updateData: any = {};

    console.log('🧪 TESTE DE DADOS DO FORMULÁRIO');
    console.log('📋 Form Values:', formValues);

    // Simular processamento
    if (formValues.firstName?.trim()) updateData.firstName = formValues.firstName.trim();
    if (formValues.lastName?.trim()) updateData.lastName = formValues.lastName.trim();
    if (formValues.username?.trim()) updateData.username = formValues.username.trim();
    if (formValues.cpf?.trim()) updateData.cpf = formValues.cpf.replace(/\D/g, '');

    console.log('📦 Dados que seriam enviados:', updateData);
    console.log('🔢 Quantidade de campos:', Object.keys(updateData).length);
    console.log('📝 JSON que seria enviado:', JSON.stringify(updateData, null, 2));
  }

  testSingleField(fieldName: string, value: string): void {
    const testData = { [fieldName]: value };
    
    console.log(`🧪 Testando campo único: ${fieldName}`);
    console.log('📦 Dados de teste:', testData);
    
    this.userService.updateUser(this.userId, testData).subscribe({
      next: (response) => {
        console.log(`✅ Teste ${fieldName} bem-sucedido:`, response);
      },
      error: (err) => {
        console.error(`❌ Teste ${fieldName} falhou:`, err);
        if (err.error?.message) {
          console.error('📝 Erro específico:', err.error.message);
        }
      }
    });
  }

  canSubmit(): boolean {
    const formValues = this.updateForm.getRawValue();
    
    // Verificar se pelo menos um campo foi preenchido
    const hasData = !!(
      formValues.firstName?.trim() || 
      formValues.lastName?.trim() || 
      formValues.username?.trim() || 
      formValues.cpf?.trim() || 
      formValues.cep?.trim() || 
      formValues.numero?.trim() ||
      formValues.complemento?.trim()
    );

    // Verificar se CPF é válido (se preenchido)
    let cpfValid = true;
    if (formValues.cpf?.trim()) {
      const cpfControl = this.updateForm.get('cpf');
      cpfValid = cpfValidator(cpfControl!) === null;
    }

    // Verificar se CEP é válido (se preenchido)
    let cepValid = true;
    if (formValues.cep?.trim()) {
      const cep = formValues.cep.replace(/\D/g, '');
      cepValid = cep.length === 8;
    }

    return hasData && cpfValid && cepValid && !this.loading;
  }

  onDeleteAccount(): void {
    this.showDeleteModal = true;
    this.confirmEmailInput = '';
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.confirmEmailInput = '';
  }

  isEmailConfirmed(): boolean {
    const currentUser = this.authService.currentUserValue;
    return this.confirmEmailInput === currentUser?.email;
  }

  confirmDelete(): void {
    if (!this.isEmailConfirmed()) return;

    this.deleting = true;
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser?.email) {
      this.error = 'Erro ao obter dados do usuário';
      this.deleting = false;
      return;
    }

    this.userService.requestAccountDeletion(currentUser.email).subscribe({
      next: (response) => {
        console.log('✅ Solicitação de exclusão enviada:', response);
        this.deleting = false;
        this.showDeleteModal = false;
        this.successMessage = 'Solicitação de exclusão enviada! Verifique seu email.';
        
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Erro ao solicitar exclusão:', err);
        this.deleting = false;
        this.showDeleteModal = false;
        this.error = err.error?.message || 'Erro ao solicitar exclusão da conta. Tente novamente.';
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.updateForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  clearAuthAndReload(): void {
    console.log('🔄 Limpando dados de autenticação...');
    localStorage.clear();
    sessionStorage.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  debugCpf(): void {
    const cpfControl = this.updateForm.get('cpf');
    if (cpfControl) {
      const value = cpfControl.value;
      const errors = cpfValidator(cpfControl);
      console.log('🔍 Debug CPF:', {
        valor: value,
        somenteNumeros: value?.replace(/\D/g, ''),
        temErros: errors !== null,
        erros: errors
      });
    }
  }

  testCpfValidation(cpf: string): boolean {
    const testControl = { value: cpf } as AbstractControl;
    const result = cpfValidator(testControl);
    console.log(`CPF ${cpf}: ${result === null ? 'VÁLIDO' : 'INVÁLIDO'}`);
    return result === null;
  }

  debugFormStatus(): void {
    console.log('📋 STATUS DO FORMULÁRIO:');
    console.log('Valid:', this.updateForm.valid);
    console.log('Errors:', this.updateForm.errors);
    console.log('Value:', this.updateForm.value);
    console.log('Raw Value:', this.updateForm.getRawValue());
    
    // Debug de cada campo individualmente
    Object.keys(this.updateForm.controls).forEach(key => {
      const control = this.updateForm.get(key);
      if (control) {
        console.log(`${key}:`, {
          value: control.value,
          valid: control.valid,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty
        });
      }
    });
  }
}
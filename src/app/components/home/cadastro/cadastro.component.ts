// cadastro.component.ts
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  loading = false;
  error = '';
  fieldErrors: {[key: string]: string} = {};
  
  // ✅ Sistema de notificações
  notification: NotificationState = {
    show: false,
    type: 'info',
    message: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.cadastroForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.senhasConferem }); 
  }

  // ✅ CORRIGIDO: Validador de senhas com nomes corretos
  senhasConferem(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      // Aplicar erro no campo confirmPassword
      const confirmPasswordControl = control.get('confirmPassword');
      if (confirmPasswordControl) {
        confirmPasswordControl.setErrors({ passwordsMismatch: true });
      }
      return { passwordsMismatch: true };
    }
    
    // Limpar erro se as senhas conferirem
    const confirmPasswordControl = control.get('confirmPassword');
    if (confirmPasswordControl && confirmPasswordControl.hasError('passwordsMismatch')) {
      confirmPasswordControl.setErrors(null);
    }
    
    return null;
  }

  // ✅ Métodos para controlar notificações
  showNotification(type: 'success' | 'error' | 'info', message: string, duration: number = 0) {
    this.notification = {
      show: true,
      type,
      message
    };
    this.cdr.detectChanges();

    if (duration > 0) {
      setTimeout(() => {
        this.hideNotification();
      }, duration);
    }
  }

  hideNotification() {
    this.notification.show = false;
    this.cdr.detectChanges();
  }

  onSubmit() {
    this.error = '';
    this.fieldErrors = {};
    this.hideNotification();

    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      this.showNotification('error', 'Por favor, corrija os erros no formulário.', 4000);
      return;
    }

    this.loading = true;
    
    // ✅ Mostrar notificação de carregamento
    this.showNotification('info', 'Criando conta...');

    // ✅ CORRIGIDO: Remover propriedades que causam erro 400
    const formData = {
      firstName: this.cadastroForm.value.firstName,
      lastName: this.cadastroForm.value.lastName,
      email: this.cadastroForm.value.email,
      password: this.cadastroForm.value.password
      // ❌ REMOVIDO: role e isClient (backend define automaticamente)
    };

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.loading = false;
        
        // ✅ Mostrar notificação de sucesso
        this.showNotification('success', 'Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.');
        
        // ✅ Aguardar 3 segundos antes de redirecionar
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            state: { 
              successMessage: 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar sua conta.',
              email: this.cadastroForm.value.email
            }
          });
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro no cadastro:', err);
        
        let errorMessage = 'Erro inesperado. Tente novamente mais tarde.';
        
        // Tratamento de erros da API
        if (err.error?.message) {
          if (Array.isArray(err.error.message)) {
            errorMessage = err.error.message[0]; // Primeiro erro da lista
          } else {
            errorMessage = err.error.message;
          }
        } else if (err.status === 400) {
          errorMessage = 'Erro ao processar seu cadastro. Verifique os dados.';
        } else if (err.status === 409) {
          errorMessage = 'E-mail já cadastrado. Use outro e-mail ou faça login.';
        }
        
        // ✅ Mostrar notificação de erro
        this.showNotification('error', errorMessage);
        this.error = errorMessage;
        
        // Mostra erros específicos de campos
        if (err.error?.errors) {
          this.fieldErrors = err.error.errors;
          Object.keys(this.fieldErrors).forEach(field => {
            const control = this.cadastroForm.get(field);
            if (control) {
              control.setErrors({ apiError: true });
              control.markAsTouched();
            }
          });
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  checkEmail() {
    const email = this.cadastroForm.get('email')?.value;
    if (email && this.cadastroForm.get('email')?.valid) {
      this.authService.checkEmailExists(email).subscribe({
        next: (exists) => {
          if (exists) {
            this.cadastroForm.get('email')?.setErrors({ emailExists: true });
          }
        },
        error: (err) => {
          console.error('Erro ao verificar email:', err);
        }
      });
    }
  }

  navegarParaLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.cadastroForm.get(controlName);
    
    // Verifica erros do FormGroup primeiro (validação frontend)
    if (control?.touched && control?.hasError(errorName)) {
      return true;
    }
    
    // Verifica se há erros da API para este campo
    if (this.fieldErrors[controlName]) {
      return true;
    }
    
    return false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.cadastroForm.get(controlName);
    
    // Primeiro verifica erros da API
    if (this.fieldErrors[controlName]) {
      return this.fieldErrors[controlName];
    }
    
    // Depois verifica erros de validação do frontend
    if (control?.hasError('required')) {
      return 'Campo obrigatório';
    }
    if (control?.hasError('email')) {
      return 'E-mail inválido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo de ${control.getError('minlength').requiredLength} caracteres`;
    }
    if (control?.hasError('passwordsMismatch')) {
      return 'As senhas não conferem';
    }
    if (control?.hasError('emailExists')) {
      return 'Este e-mail já está cadastrado';
    }
    
    return '';
  }
}
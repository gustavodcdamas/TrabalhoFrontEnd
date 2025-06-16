// reset.component.ts - CORRIGIDO
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  error = '';
  fieldErrors: {[key: string]: string} = {};
  resetToken: string = '';

  // ✅ Sistema de notificações (igual ao cadastro)
  notification: NotificationState = {
    show: false,
    type: 'info',
    message: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute, // ✅ ADICIONADO para pegar token da URL
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // ✅ CORRIGIDO: Apenas campos necessários para reset de senha
    this.resetForm = this.formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.senhasConferem }); 
  }

  ngOnInit() {
    // ✅ PEGAR TOKEN DA URL
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (!this.resetToken) {
        this.showNotification('error', 'Token de reset não encontrado');
        setTimeout(() => {
          this.router.navigate(['/auth/forgot-password']);
        }, 3000);
      }
    });
  }

  // ✅ CORRIGIDO: Validador de senhas
  senhasConferem(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
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

  // ✅ Métodos para controlar notificações (copiados do cadastro)
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

    console.log('🔐 [Reset] Dados do formulário:', {
      password: this.resetForm.value.password ? '[SENHA FORNECIDA]' : '[SENHA VAZIA]',
      confirmPassword: this.resetForm.value.confirmPassword ? '[CONFIRMAÇÃO FORNECIDA]' : '[CONFIRMAÇÃO VAZIA]',
      token: this.resetToken ? '[TOKEN FORNECIDO]' : '[TOKEN VAZIO]'
    });

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.showNotification('error', 'Por favor, corrija os erros no formulário.', 4000);
      return;
    }

    if (!this.resetToken) {
      this.showNotification('error', 'Token de reset inválido');
      return;
    }

    this.loading = true;
    this.showNotification('info', 'Redefinindo senha...');

    // ✅ CORRIGIDO: Usar o método resetPassword do AuthService
    const newPassword = this.resetForm.value.password;
    const confirmPassword = this.resetForm.value.confirmPassword;

    console.log('🔐 [Reset] Enviando senha para API:', {
      passwordLength: newPassword?.length || 0,
      confirmPasswordLength: confirmPassword?.length || 0,
      passwordsMatch: newPassword === confirmPassword
    });

    this.authService.resetPassword(this.resetToken, newPassword, confirmPassword).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ [Reset] Senha redefinida com sucesso:', response);
        
        this.showNotification('success', 'Senha redefinida com sucesso!');
        
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            state: { 
              successMessage: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
              email: '' // Não temos email no reset
            }
          });
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ [Reset] Erro ao redefinir senha:', err);
        
        let errorMessage = 'Erro inesperado. Tente novamente mais tarde.';
        
        if (err.error?.message) {
          if (Array.isArray(err.error.message)) {
            errorMessage = err.error.message[0];
          } else {
            errorMessage = err.error.message;
          }
        } else if (err.status === 400) {
          errorMessage = 'Token inválido ou expirado. Solicite um novo reset de senha.';
        } else if (err.status === 404) {
          errorMessage = 'Token não encontrado. Solicite um novo reset de senha.';
        }
        
        this.showNotification('error', errorMessage);
        this.error = errorMessage;
        
        if (err.error?.errors) {
          this.fieldErrors = err.error.errors;
          Object.keys(this.fieldErrors).forEach(field => {
            const control = this.resetForm.get(field);
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

  navegarParaLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.resetForm.get(controlName);
    
    if (control?.touched && control?.hasError(errorName)) {
      return true;
    }
    
    if (this.fieldErrors[controlName]) {
      return true;
    }
    
    return false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetForm.get(controlName);
    
    if (this.fieldErrors[controlName]) {
      return this.fieldErrors[controlName];
    }
    
    if (control?.hasError('required')) {
      return 'Campo obrigatório';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo de ${control.getError('minlength').requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Deve conter maiúsculas, minúsculas, números e símbolos';
    }
    if (control?.hasError('passwordsMismatch')) {
      return 'As senhas não conferem';
    }
    
    return '';
  }
}
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-reset',
  imports: [ ReactiveFormsModule, HeaderComponent, CommonModule, FooterComponent ],
  templateUrl: './request-reset.component.html',
  styleUrls: ['./request-reset.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RequestResetComponent {
  resetForm: FormGroup;
  loading = false;
  success = false;
  error = '';
  
  // Adicione esta propriedade
  notification = {
    show: false,
    type: '',
    message: ''
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Adicione esta injeção
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

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
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.showNotification('error', 'Por favor, informe um e-mail válido.', 4000);
      return;
    }

    this.loading = true;
    this.error = '';
    this.hideNotification();
    
    // ✅ Mostrar notificação de carregamento
    this.showNotification('info', 'Enviando solicitação...');
    
    this.authService.requestPasswordReset(this.resetForm.value.email).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        
        // ✅ Mostrar notificação de sucesso
        this.showNotification('success', 'E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        
        // ✅ Aguardar 3 segundos antes de permitir navegação
        setTimeout(() => {
          // Opcional: redirecionar automaticamente ou deixar o usuário escolher
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao solicitar reset:', err);
        
        let errorMessage = 'Erro ao solicitar redefinição de senha. Tente novamente.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 404) {
          errorMessage = 'E-mail não encontrado em nossa base de dados.';
        } else if (err.status === 0) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        
        this.error = errorMessage;
        this.showNotification('error', errorMessage);
      }
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.resetForm.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
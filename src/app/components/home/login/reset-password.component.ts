import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [ ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  loading = false;
  success = false;
  error = '';
  validating = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    console.log('🔄 Iniciando componente ResetPassword');
    
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log('🔍 Token extraído da URL:', token);
    
    if (!token) {
      console.log('❌ Nenhum token encontrado na URL');
      this.router.navigate(['/auth/login'], {
        queryParams: { error: 'token-invalido' }
      });
      return;
    }
    
    this.token = token;
    console.log('✅ Token definido no componente:', this.token.length, 'caracteres');

    // ✅ Validar token ao carregar
    this.validateToken();
  }

  private validateToken() {
    console.log('🔍 Iniciando validação do token...');
    this.validating = true;
    this.error = '';
    
    this.authService.validateResetToken(this.token).subscribe({
      next: (isValid) => {
        console.log('📨 Resposta da validação:', isValid);
        this.validating = false;
        
        if (!isValid) {
          console.log('❌ Token inválido ou expirado');
          this.error = 'Link inválido ou expirado. Solicite um novo.';
        } else {
          console.log('✅ Token válido, usuário pode redefinir senha');
        }
      },
      error: (err) => {
        console.error('❌ Erro ao validar token:', err);
        this.validating = false;
        this.error = 'Erro ao validar o link. Tente novamente.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

onSubmit() {
  console.log('📤 Tentando submeter formulário...');
  
  if (this.resetForm.invalid) {
    console.log('❌ Formulário inválido');
    return;
  }
  
  if (!this.token) {
    console.log('❌ Token não disponível');
    this.error = 'Token não disponível. Recarregue a página.';
    return;
  }

  this.loading = true;
  this.error = '';
  
  const formValues = this.resetForm.value;
  console.log('📤 Enviando requisição de reset para:', this.token.substring(0, 10) + '...');
  
  // ✅ Enviar ambos os campos
  this.authService.resetPassword(
    this.token, 
    formValues.newPassword,
    formValues.confirmPassword  // ✅ Adicionado
  ).subscribe({
    next: (response) => {
      console.log('✅ Senha redefinida com sucesso:', response);
      this.success = true;
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Erro ao redefinir senha:', err);
      this.error = err.error?.message || 'Erro ao redefinir senha';
      this.loading = false;
    }
  });
}
}
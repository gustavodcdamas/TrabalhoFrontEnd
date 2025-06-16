import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRole } from '../../../models/user.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    console.log('Estado de login ao entrar:', this.authService.isLoggedIn());
    console.log('Usuário atual:', this.authService.currentUserValue);
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });

    // ✅ VERIFICAR SE JÁ ESTÁ LOGADO E REDIRECIONAR BASEADO NO ROLE
    if (this.authService.isLoggedIn()) {
      console.log('Usuário já logado, redirecionando...');
      this.redirectBasedOnRole(this.authService.currentUserValue?.role);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params['error'] === 'token-required') {
        this.error = 'Link inválido: token não encontrado';
      } else if (params['error'] === 'invalid-token') {
        this.error = 'Link inválido ou expirado. Solicite um novo.';
      } else if (params['error'] === 'token-validation-failed') {
        this.error = 'Erro ao validar o link. Tente novamente.';
      }
    });
  }

  onSubmit() {
    this.error = '';
    
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, senha } = this.loginForm.value;
    
    this.authService.login(email, senha).subscribe({
      next: (user) => {
        console.log('Login bem-sucedido, usuário:', user);
        
        // ✅ REDIRECIONAMENTO BASEADO NO ROLE DO USUÁRIO
        this.redirectBasedOnRole(user.role);
      },
      error: (error) => {
        this.error = error.error?.message || 'Erro ao fazer login';
        this.loading = false;
        if (error.error?.statusCode === 403 && error.error?.message === 'Invalid CSRF token') {
          this.onSubmit();
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA REDIRECIONAR BASEADO NO ROLE
  private redirectBasedOnRole(role?: UserRole): void {
    switch (role) {
      case UserRole.CLIENT:
        console.log('Redirecionando cliente para /cliente');
        this.router.navigate(['/cliente']);
        break;
        
      case UserRole.ADMIN:
        console.log('Redirecionando admin para /admin');
        this.router.navigate(['/admin']);
        break;
        
      case UserRole.SUPER_ADMIN:
        console.log('Redirecionando super admin para /admin');
        this.router.navigate(['/admin']); // ou /super-admin se preferir
        break;
        
      default:
        console.log('Role não identificado, redirecionando para home');
        this.router.navigate(['/']);
        break;
    }
  }

  navegarParaRecuperarSenha(): void {
    this.router.navigate(['/auth/request-reset']);
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/auth/register']);
  }
}
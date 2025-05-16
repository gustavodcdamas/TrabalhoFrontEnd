// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Aqui você implementaria a lógica de autenticação
      console.log('Formulário enviado:', this.loginForm.value);

      // Exemplo de navegação após login bem-sucedido
      // this.router.navigate(['/dashboard']);

      // Por enquanto, só vamos simular um login bem-sucedido com um alerta
      alert('Login realizado com sucesso!');
    } else {
      // Marcar todos os campos como touched para mostrar os erros
      this.loginForm.markAllAsTouched();
    }
  }

  // Métodos auxiliares para validação
  get email() {
    return this.loginForm.get('email');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
   navegarParaAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }
}

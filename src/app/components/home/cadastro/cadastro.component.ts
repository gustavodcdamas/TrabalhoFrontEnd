// cadastro.component.ts
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css'],
    encapsulation: ViewEncapsulation.None

})
export class CadastroComponent {
  cadastroForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.cadastroForm = this.formBuilder.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.senhasConferem });
  }

  // Validador personalizado para verificar se as senhas conferem
  senhasConferem(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (senha && confirmarSenha && senha !== confirmarSenha) {
      control.get('confirmarSenha')?.setErrors({ senhasNaoConferem: true });
      return { senhasNaoConferem: true };
    }

    return null;
  }

  onSubmit() {
    if (this.cadastroForm.valid) {
      // Aqui você implementaria a lógica de cadastro
      console.log('Formulário de cadastro enviado:', this.cadastroForm.value);

      // Alerta de sucesso
      alert('Cadastro realizado com sucesso!');

      // Redireciona para a página de login após o cadastro
      this.navegarParaLogin();
    } else {
      // Marcar todos os campos como touched para mostrar os erros
      this.cadastroForm.markAllAsTouched();
    }
  }

  // Método para navegação
  navegarParaLogin(): void {
    this.router.navigate(['/login']);
  }

  // Método auxiliar para validação
  hasError(controlName: string, errorName: string): boolean {
    const control = this.cadastroForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';

// ✅ IMPORTAR componentes standalone
import { LoginComponent } from '../../components/home/login/login.component';
import { CadastroComponent } from '../../components/home/cadastro/cadastro.component';
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';

@NgModule({
  declarations: [
    // ❌ VAZIO: Componentes standalone não vão aqui
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    // ✅ ADICIONAR: Componentes standalone vão nos imports
    LoginComponent,
    CadastroComponent,
    RequestResetComponent,
    ResetPasswordComponent
  ]
})
export class AuthModule { }
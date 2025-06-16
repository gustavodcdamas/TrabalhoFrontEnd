import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../../components/home/login/login.component';
import { CadastroComponent } from '../../components/home/cadastro/cadastro.component';
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';
import { ResetPasswordGuard } from '../../core/guards/reset-password.guard';
import { HomeComponent } from '../../components/home/home/home.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: CadastroComponent },
  { path: 'home', component: HomeComponent },
  { path: 'request-reset', component: RequestResetComponent },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent,
    canActivate: [ResetPasswordGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
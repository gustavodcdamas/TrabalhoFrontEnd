import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminRoutingModule } from './super-admin-routing.module';

// ✅ IMPORTAR componentes standalone
import { AdminDashboardComponent } from '../../components/admin/admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from '../../components/admin/dashboard/dashboard.component';
import { ClientesComponent } from '../../components/admin/clientes/clientes.component';
import { ContasComponent } from '../../components/admin/contas/contas.component';
import { ServicosComponent } from '../../components/admin/servicos/servicos.component';
import { ComprasComponent } from '../../components/admin/compras/compras.component';
import { AdminCriativosComponent } from '../../components/admin/admin-criativos/admin-criativos.component';
import { IdvsComponent } from '../../components/admin/idvs/idvs.component';
import { LandingComponent } from '../../components/admin/landing/landing.component';
import { institucionalComponent } from '../../components/admin/institucional/institucional.component';
import { UpdateComponent } from '../../components/admin/updateUsuario/update.component';
import { admsComponent } from '../../components/admin/adms/adms.component';
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';

@NgModule({
  declarations: [
    // ❌ VAZIO: Componentes standalone não vão aqui
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    // ✅ ADICIONAR: Componentes standalone vão nos imports
    AdminDashboardComponent,
    DashboardComponent,
    ClientesComponent,
    ContasComponent,
    ServicosComponent,
    ComprasComponent,
    AdminCriativosComponent,
    IdvsComponent,
    LandingComponent,
    institucionalComponent,
    UpdateComponent,
    admsComponent,
    RequestResetComponent,
    ResetPasswordComponent
  ]
})
export class SuperAdminModule { }
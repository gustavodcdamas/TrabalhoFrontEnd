import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteRoutingModule } from './cliente-routing.module';

// ✅ IMPORTAR componentes standalone
import { AdminDashboardComponent } from '../../components/admin/admin-dashboard/admin-dashboard.component';
import { ComprasComponent } from '../../components/admin/compras/compras.component';
import { AreaClienteComponent } from '../../components/admin/area-cliente/AreaCliente.component';
import { UpdateComponent } from '../../components/admin/updateUsuario/update.component';
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';

@NgModule({
  declarations: [
    // ❌ VAZIO: Componentes standalone não vão aqui
  ],
  imports: [
    CommonModule,
    ClienteRoutingModule,
    // ✅ ADICIONAR: Componentes standalone vão nos imports
    AdminDashboardComponent,
    ComprasComponent,
    AreaClienteComponent,
    UpdateComponent,
    RequestResetComponent,
    ResetPasswordComponent
  ]
})
export class ClienteModule { }
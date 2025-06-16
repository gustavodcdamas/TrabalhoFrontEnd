import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ResetPasswordGuard } from '../../core/guards/reset-password.guard';
import { UserRole } from '../../models/user.model';
import { AdminDashboardComponent } from '../../components/admin/admin-dashboard/admin-dashboard.component';
import { ComprasComponent } from '../../components/admin/compras/compras.component';
import { AreaClienteComponent } from '../../components/admin/area-cliente/AreaCliente.component';
import { UpdateComponent } from '../../components/admin/updateUsuario/update.component';
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    data: { expectedRoles: [UserRole.CLIENT] },
    children: [
      { path: '', redirectTo: 'area-cliente', pathMatch: 'full' },
      { 
        path: 'pedidos',
        component: ComprasComponent,
        data: { expectedRoles: [UserRole.CLIENT] }
      },
      { 
        path: 'cancelar-pedido',
        component: ComprasComponent,
        data: { expectedRoles: [UserRole.CLIENT] }
      },
      { 
        path: 'area-cliente',
        component: AreaClienteComponent,
        data: { expectedRoles: [UserRole.CLIENT] }
      },
      {
        path: 'update-profile',
        component: UpdateComponent,
        data: { expectedRoles: [UserRole.CLIENT] }
      },
      { 
        path: 'request-reset',
        component: RequestResetComponent,
        data: { expectedRoles: [UserRole.CLIENT] }
      },
      { 
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { expectedRoles: [UserRole.CLIENT] },
        canActivate: [ResetPasswordGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
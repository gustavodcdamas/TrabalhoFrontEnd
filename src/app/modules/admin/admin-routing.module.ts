import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ResetPasswordGuard } from '../../core/guards/reset-password.guard';
import { UserRole } from '../../models/user.model';
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
import { RequestResetComponent } from '../../components/home/login/request-reset.component';
import { ResetPasswordComponent } from '../../components/home/login/reset-password.component';
import { MonitoringComponent } from 'src/app/components/admin/monitoramento/monitoramento.component';
// ✅ NOVOS IMPORTS PARA MONITORAMENTO

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    data: { expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        data: { expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        canActivate: [AuthGuard]
      },
      
      // ✅ MONITORAMENTO - NOVO MENU
      { 
        path: 'monitoring',
        component: MonitoringComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Monitoramento do Sistema'
        },
        canActivate: [AuthGuard]
      },
      
      // ✅ LOGS - REDIRECT PARA ABA ESPECÍFICA DO MONITORAMENTO
      { 
        path: 'logs',
        redirectTo: 'monitoring?tab=logs',
        pathMatch: 'full'
      },
      
      { 
        path: 'contas',
        component: ContasComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar Contas'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'clientes',
        component: ClientesComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar Clientes'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'servicos',
        component: ServicosComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar Serviços'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'compras',
        component: ComprasComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT],
          title: 'Gerenciar Compras'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'cancelar-pedido',
        component: ComprasComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT],
          title: 'Cancelar Pedidos'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'criativos',
        component: AdminCriativosComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar Criativos'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'idvs',
        component: IdvsComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar IDVs'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'landing',
        component: LandingComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Gerenciar Landing Pages'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'institucional',
        component: institucionalComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          title: 'Conteúdo Institucional'
        },
        canActivate: [AuthGuard]
      },
      {
        path: 'update-profile',
        component: UpdateComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT],
          title: 'Atualizar Perfil'
        },
        canActivate: [AuthGuard]
      },
      { 
        path: 'request-reset',
        component: RequestResetComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT],
          title: 'Redefinir Senha'
        }
      },
      { 
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { 
          expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT],
          title: 'Nova Senha'
        },
        canActivate: [ResetPasswordGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
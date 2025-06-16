// app-routing.module.ts - VERSÃO COM LAZY LOADING
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

// 🎯 GUARDS e MODELS (mantém)
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';
import { ResetPasswordGuard } from './core/guards/reset-password.guard';
import { UserRole } from './models/user.model';

// ✅ APENAS componentes carregados IMEDIATAMENTE
import { HomeComponent } from './components/home/home/home.component';
import { PageNotFoundComponent } from './components/shared/page-not-found/page-not-found.component';

export const routes: Routes = [
  // ✅ Rotas carregadas IMEDIATAMENTE
  { path: '', component: HomeComponent },
  { path: '404', component: PageNotFoundComponent },
  
  // 🆕 ROTAS PÚBLICAS (lazy loading)
  {
    path: '',
    loadChildren: () => import('./modules/public/public.module').then(m => m.PublicModule)
  },

  // 🆕 ROTAS DE AUTENTICAÇÃO (lazy loading)
  {
    path: 'auth',
    canActivate: [PublicGuard],
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // 🆕 ROTAS DE CLIENTE (lazy loading)
  {
    path: 'cliente',
    canActivate: [AuthGuard],
    data: { expectedRoles: [UserRole.CLIENT] },
    loadChildren: () => import('./modules/cliente/cliente.module').then(m => m.ClienteModule)
  },

  // 🆕 ROTAS DE ADMIN (lazy loading)
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { expectedRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },

  // 🆕 ROTAS DE SUPER ADMIN (lazy loading)
  {
    path: 'super-admin',
    canActivate: [AuthGuard],
    data: { expectedRoles: [UserRole.SUPER_ADMIN] },
    loadChildren: () => import('./modules/super-admin/super-admin.module').then(m => m.SuperAdminModule)
  },

  // ✅ Rota de fallback
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // 🎯 Estratégia de preload (opcional)
    preloadingStrategy: PreloadAllModules,
    // enableTracing: true // Para debug (remover em produção)
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }


import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home.component';
import { PageNotFoundComponent } from './components/shared/page-not-found/page-not-found.component';
import { SobreNosComponent } from './components/home/sobre-nos/sobre-nos.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';

// Importação dos componentes de subpáginas
import { ClientesComponent } from './components/admin/clientes/clientes.component';
import { ContasComponent } from './components/admin/contas/contas.component';
import { ServicosComponent } from './components/admin/servicos/servicos.component';
import { ComprasComponent } from './components/admin/compras/compras.component';
import { IdvsComponent } from './components/admin/idvs/idvs.component';
import { ServicesComponent } from './components/admin/services/services.component';
import { MyPrivilegesComponent } from './components/admin/my-privileges/my-privileges.component';
import { SettingComponent } from './components/admin/setting/setting.component';
import { LoginComponent } from './components/home/login/login.component';
import { CadastroComponent } from './components/home/cadastro/cadastro.component';

// Importação correta do componente de contato
import { DecimaSecaoContatoComponent } from './components/home/decima-secao-contato/decima-secao-contato.component';
import { PortifolioComponent } from './components/home/portifolio/portifolio.component';
import { PoliticaPrivacidadeComponent } from './components/home/politica-privacidade/politica-privacidade.component';
import { TermosServicoComponent } from './components/home/termos-servico/termos-servico.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contato', component: DecimaSecaoContatoComponent },
  { path: 'portifolio', component: PortifolioComponent },
  { path: 'projetos', redirectTo: 'portifolio', pathMatch: 'full' }, // Alias para manter compatibilidade
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'sobre-nos', component: SobreNosComponent },
  { path: 'politica-privacidade', component: PoliticaPrivacidadeComponent },
  { path: 'termos-servico', component: TermosServicoComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'contas', component: ContasComponent },
      { path: 'servicos', component: ServicosComponent },
      { path: 'compras', component: ComprasComponent },
      { path: 'idvs', component: IdvsComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'my-privileges', component: MyPrivilegesComponent },
      { path: 'setting', component: SettingComponent }
    ]
  },
  { path: '**', component: PageNotFoundComponent } // Wildcard sempre por último
];

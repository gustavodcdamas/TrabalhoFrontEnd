import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home.component';
import { PageNotFoundComponent } from './components/shared/page-not-found/page-not-found.component';
import { SobreNosComponent } from './components/home/sobre-nos/sobre-nos.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', component: PageNotFoundComponent }, // Rota para página não encontrada

];

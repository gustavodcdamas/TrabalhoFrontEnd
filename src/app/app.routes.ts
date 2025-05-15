import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home.component';
import { PageNotFoundComponent } from './components/shared/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', component: PageNotFoundComponent } // Rota para página não encontrada
];

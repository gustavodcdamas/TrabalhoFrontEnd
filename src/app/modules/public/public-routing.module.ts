import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SobreNosComponent } from '../../components/home/sobre-nos/sobre-nos.component';
import { DecimaSecaoContatoComponent } from '../../components/home/decima-secao-contato/decima-secao-contato.component';
import { PortifolioComponent } from '../../components/home/portifolio/portifolio.component';
import { PoliticaPrivacidadeComponent } from '../../components/home/politica-privacidade/politica-privacidade.component';
import { TermosServicoComponent } from '../../components/home/termos-servico/termos-servico.component';

const routes: Routes = [
  { path: 'contato', component: DecimaSecaoContatoComponent },
  { path: 'portifolio', component: PortifolioComponent },
  { path: 'projetos', redirectTo: 'portifolio', pathMatch: 'full' },
  { path: 'sobre-nos', component: SobreNosComponent },
  { path: 'politica-privacidade', component: PoliticaPrivacidadeComponent },
  { path: 'termos-servico', component: TermosServicoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
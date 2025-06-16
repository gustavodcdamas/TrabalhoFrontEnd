import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing.module';

// ✅ IMPORTAR componentes standalone
import { SobreNosComponent } from '../../components/home/sobre-nos/sobre-nos.component';
import { DecimaSecaoContatoComponent } from '../../components/home/decima-secao-contato/decima-secao-contato.component';
import { PortifolioComponent } from '../../components/home/portifolio/portifolio.component';
import { PoliticaPrivacidadeComponent } from '../../components/home/politica-privacidade/politica-privacidade.component';
import { TermosServicoComponent } from '../../components/home/termos-servico/termos-servico.component';

@NgModule({
  declarations: [
    // ❌ REMOVER: Componentes standalone não vão aqui
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    // ✅ ADICIONAR: Componentes standalone vão nos imports
    SobreNosComponent,
    DecimaSecaoContatoComponent,
    PortifolioComponent,
    PoliticaPrivacidadeComponent,
    TermosServicoComponent
  ]
})
export class PublicModule { }
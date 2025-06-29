import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminCriativosComponent } from "../../admin/admin-criativos/admin-criativos.component";
import { PrimeiraSecaoComponent } from '../primeira-secao/primeira-secao.component';
import { SegundaSecaoServicosComponent } from '../segunda-secao-servicos/segunda-secao-servicos.component';
import { TerceiraSecaoPortfolioComponent } from '../terceira-secao-portfolio/terceira-secao-portfolio.component';
import { QuartaSecaoServicosIndividuaisComponent } from '../quarta-secao-servicos-individuais/quarta-secao-servicos-individuais.component';
import { QuintaSecaoPacotesComponent } from '../quinta-secao-pacotes/quinta-secao-pacotes.component';
import { SextaSecaoSolucoesComponent } from '../sexta-secao-solucoes/sexta-secao-solucoes.component';
import { SetimaSecaoBeneficiosComponent } from '../setima-secao-beneficios/setima-secao-beneficios.component';
import { OitavaSecaoSobreComponent } from '../oitava-secao-sobre/oitava-secao-sobre.component';
import { NonaSecaoDuvidasComponent } from '../nona-secao-duvidas/nona-secao-duvidas.component';
import { DecimaSecaoContatoComponent } from '../decima-secao-contato/decima-secao-contato.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AdminCriativosComponent ,PrimeiraSecaoComponent,SegundaSecaoServicosComponent, FooterComponent, TerceiraSecaoPortfolioComponent,QuartaSecaoServicosIndividuaisComponent,QuintaSecaoPacotesComponent,SextaSecaoSolucoesComponent,SetimaSecaoBeneficiosComponent,OitavaSecaoSobreComponent,NonaSecaoDuvidasComponent,DecimaSecaoContatoComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

}

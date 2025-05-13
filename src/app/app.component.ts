import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeiraSecaoComponent } from './components/home/primeira-secao/primeira-secao.component';
import { HeaderComponent } from "./components/shared/header/header.component";
import { SegundaSecaoServicosComponent } from './components/home/segunda-secao-servicos/segunda-secao-servicos.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { TerceiraSecaoPortfolioComponent } from "./components/home/terceira-secao-portfolio/terceira-secao-portfolio.component";
import { SextaSecaoSolucoesComponent } from "./components/home/sexta-secao-solucoes/sexta-secao-solucoes.component";
import { QuartaSecaoServicosIndividuaisComponent } from "./components/home/quarta-secao-servicos-individuais/quarta-secao-servicos-individuais.component";
import { QuintaSecaoPacotesComponent } from "./components/home/quinta-secao-pacotes/quinta-secao-pacotes.component";
import { SetimaSecaoBeneficiosComponent } from "./components/home/setima-secao-beneficios/setima-secao-beneficios.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PrimeiraSecaoComponent, HeaderComponent, SegundaSecaoServicosComponent, FooterComponent, SextaSecaoSolucoesComponent, TerceiraSecaoPortfolioComponent, QuartaSecaoServicosIndividuaisComponent, SetimaSecaoBeneficiosComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'agencia-frontend';
}

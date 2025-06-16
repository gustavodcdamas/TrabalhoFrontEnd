import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../../src/app/components/shared/header/header.component';
import { FooterComponent } from '../../../../../src/app/components/shared/footer/footer.component';
@Component({
  selector: 'app-politica-privacidade',
  standalone: true, // Se você estiver usando componentes standalone
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent], // Importações necessárias
  templateUrl: './politica-privacidade.component.html',
  styleUrl: './politica-privacidade.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoliticaPrivacidadeComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Define o título da página
    this.titleService.setTitle('Política de Privacidade | Agência Cuei');

    // Adiciona meta tags para SEO
    this.metaService.updateTag({ name: 'description', content: 'Política de Privacidade da Agência Cuei. Saiba como coletamos, usamos e protegemos suas informações pessoais ao utilizar nossos serviços.' });
    this.metaService.updateTag({ name: 'keywords', content: 'política de privacidade, proteção de dados, agência cuei, lgpd, privacidade online' });

    // Rolar para o topo da página quando o componente for carregado
    window.scrollTo(0, 0);
  }

  // Método para lidar com o botão de orçamento
  solicitarOrcamento(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/contato'], { queryParams: { orcamento: 'true' } });
  }
}

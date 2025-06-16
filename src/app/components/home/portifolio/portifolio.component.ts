// projetos.component.ts
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { TerceiraSecaoPortfolioComponent } from '../terceira-secao-portfolio/terceira-secao-portfolio.component';

@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, TerceiraSecaoPortfolioComponent],
  templateUrl: './portifolio.component.html',
  styleUrls: ['./portifolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortifolioComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Qualquer lógica de inicialização, como carregamento de dados
  }

  // Método para lidar com o botão de orçamento
  solicitarOrcamento(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/contato'], { queryParams: { orcamento: 'true' } });
  }

  // Se você precisar adicionar mais métodos para interatividade, adicione aqui
}

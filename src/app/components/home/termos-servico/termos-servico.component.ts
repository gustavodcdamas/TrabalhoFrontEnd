import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-termos-servico',
  standalone: true, // Se você estiver usando componentes standalone
  imports: [CommonModule, RouterModule], // Importações necessárias
  templateUrl: './termos-servico.component.html',
  styleUrl: './termos-servico.component.css'
})
export class TermosServicoComponent implements OnInit {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Define o título da página
    this.titleService.setTitle('Termos de Serviço | Agência Cuei');

    // Adiciona meta tags para SEO
    this.metaService.updateTag({ name: 'description', content: 'Termos de Serviço da Agência Cuei. Conheça nossos termos e condições para utilização dos serviços de marketing digital, design e desenvolvimento web.' });
    this.metaService.updateTag({ name: 'keywords', content: 'termos de serviço, condições de uso, agência cuei, marketing digital, design, desenvolvimento web' });

    // Rolar para o topo da página quando o componente for carregado
    window.scrollTo(0, 0);
  }

  // Método para lidar com o botão de orçamento
  solicitarOrcamento(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/contato'], { queryParams: { orcamento: 'true' } });
  }
}

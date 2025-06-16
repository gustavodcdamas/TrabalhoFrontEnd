import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sexta-secao-solucoes',
  imports: [CommonModule],
  templateUrl: './sexta-secao-solucoes.component.html',
  styleUrls: ['./sexta-secao-solucoes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SextaSecaoSolucoesComponent implements OnInit {
  solutionsPosition = 0; // Posição atual do carrossel
  solutionWidth = 300; // Largura do card + gap
  solutionItems: any[] = [
    {
      title: 'Criativos',
      descriptions: ['Feed + Story = 01 unidade', 'Peça p. impressão = 01 unidade'],
      price: 'R$ 60,00'
    },
    {
      title: 'Landing Pages',
      descriptions: ['Design responsivo', 'SEO otimizado', 'Entrega rápida'],
      price: 'R$ 300,00'
    },
    {
      title: 'Gestão de Redes',
      descriptions: ['Planejamento estratégico', 'Postagens semanais', 'Relatórios mensais'],
      price: 'R$ 500,00'
    },
    {
      title: 'Consultoria Digital',
      descriptions: ['Análise de mercado', 'Estratégias personalizadas', 'Acompanhamento mensal'],
      price: 'R$ 800,00'
    },
    {
      title: 'E-commerce',
      descriptions: ['Criação de loja virtual', 'Integração com meios de pagamento', 'Suporte técnico'],
      price: 'R$ 1.200,00'
    }
  ]; // Lista de itens do carrossel
  totalSolutionSlides = 0; // Total de slides
  activeIndex = 0; // Índice do slide ativo

  ngOnInit(): void {
    this.totalSolutionSlides = Math.ceil(this.solutionItems.length / 3);
  }

  goToSlide(index: number): void {
    this.activeIndex = index;
    this.solutionsPosition = -index * this.solutionWidth * 3;
  }

  prevSlide(): void {
    this.activeIndex = Math.max(this.activeIndex - 1, 0);
    this.solutionsPosition = -this.activeIndex * this.solutionWidth * 3;
  }

  nextSlide(): void {
    this.activeIndex = Math.min(this.activeIndex + 1, this.totalSolutionSlides - 1);
    this.solutionsPosition = -this.activeIndex * this.solutionWidth * 3;
  }

  get indicators(): number[] {
    return Array(this.totalSolutionSlides).fill(0).map((_, index) => index);
  }
}

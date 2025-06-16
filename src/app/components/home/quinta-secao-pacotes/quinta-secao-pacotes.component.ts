import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-quinta-secao-pacotes',
  templateUrl: './quinta-secao-pacotes.component.html',
  imports: [CommonModule],
  styleUrls: ['./quinta-secao-pacotes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuintaSecaoPacotesComponent implements OnInit {
  servicosPosition = 0;
  servicosCardWidth = 165; // Largura do card + gap
  servicosItems = [
    { title: 'Serviço 1', description: 'Descrição do serviço 1' },
    { title: 'Serviço 2', description: 'Descrição do serviço 2' },
    { title: 'Serviço 3', description: 'Descrição do serviço 3' },
    { title: 'Serviço 4', description: 'Descrição do serviço 4' },
    { title: 'Serviço 5', description: 'Descrição do serviço 5' },
    { title: 'Serviço 6', description: 'Descrição do serviço 6' }
  ];
  activeStep = 1; // Começa na primeira etapa

  tiposPagina: string[] = ['Institucional', 'Blog', 'Portfólio', 'Loja Virtual', 'Landing Page', 'Outros'];
  selectedTiposPagina: string[] = [];
  outrosTipo: string = '';

  ngOnInit(): void {}

  // Navegação do formulário de briefing
  avancaEtapa(etapa: number): void {
    if (etapa >= 1 && etapa <= 5) {
      this.activeStep = etapa;
    }
  }

  voltaEtapa(etapa: number): void {
    if (etapa >= 1 && etapa <= 5) {
      this.activeStep = etapa;
    }
  }

  // Alternar seleção de um elemento (por evento)
  toggleSelecaoPorEvento(event: Event): void {
    const elemento = event.target as HTMLElement;
    if (elemento && elemento.classList.contains('form-option')) {
      elemento.classList.toggle('selected');
    }
  }

  // Controle do carrossel
  prevSlide(): void {
    this.servicosPosition += this.servicosCardWidth * 3;
    if (this.servicosPosition > 0) this.servicosPosition = 0;
  }

  nextSlide(): void {
    const maxPosition = -(this.servicosItems.length * this.servicosCardWidth - 3 * this.servicosCardWidth);
    this.servicosPosition -= this.servicosCardWidth * 3;
    if (this.servicosPosition < maxPosition) this.servicosPosition = maxPosition;
  }

  // Rolagem suave para um elemento
  scrollToElement(elementId: string): void {
    const target = document.getElementById(elementId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleSelecao(tipo: string) {
    if (this.selectedTiposPagina.includes(tipo)) {
      this.selectedTiposPagina = this.selectedTiposPagina.filter(t => t !== tipo);
      if (tipo === 'Outros') this.outrosTipo = '';
    } else {
      this.selectedTiposPagina.push(tipo);
    }
  }
}

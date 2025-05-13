import { Component } from '@angular/core';

declare global {
  interface Window {
    avancaEtapa: (etapa: number) => void;
    voltaEtapa: (etapa: number) => void;
    toggleSelecao: (elemento: HTMLElement) => void;
  }
}

@Component({
  selector: 'app-primeira-secao',
  templateUrl: './primeira-secao.component.html',
  imports: [],
  styleUrls: ['./primeira-secao.component.css']
})
export class PrimeiraSecaoComponent {
  constructor() {
    window.avancaEtapa = this.avancaEtapa;
    window.voltaEtapa = this.voltaEtapa;
    window.toggleSelecao = this.toggleSelecao;
  }

  avancaEtapa(etapa: number) {
    const etapas = document.querySelectorAll('.etapa');
    etapas[etapa].scrollIntoView({ behavior: 'smooth' });
  }

  voltaEtapa(etapa: number) {
    const etapas = document.querySelectorAll('.etapa');
    etapas[etapa].scrollIntoView({ behavior: 'smooth' });
  }

  toggleSelecao(elemento: HTMLElement) {
    elemento.classList.toggle('selecionado');
  }
}

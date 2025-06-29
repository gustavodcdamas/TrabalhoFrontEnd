import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  imports: [FormsModule, CommonModule],
  styleUrls: ['./primeira-secao.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class PrimeiraSecaoComponent  {
  telefone: string = '';
  nome: string = '';
  email: string = '';

  constructor() {
    window.avancaEtapa = this.avancaEtapa;
    window.voltaEtapa = this.voltaEtapa;
    window.toggleSelecao = this.toggleSelecao;
  }
  // Adicione estes métodos à sua classe PrimeiraSecaoComponent

aplicarEstiloHover(event: MouseEvent) {
  const botao = event.target as HTMLElement;
  botao.style.backgroundColor = '#FFFFFF !important';
  botao.style.color = '#FF6B00 !important';
  botao.style.border = '2px solid #FF6B00';

  // Encontrar o span dentro do botão para estilizá-lo também
  const span = botao.querySelector('span');
  if (span) {
    span.style.backgroundColor = 'rgba(255, 107, 0, 0.2) !important';
  }
}

removerEstiloHover(event: MouseEvent) {
  const botao = event.target as HTMLElement;
  botao.style.backgroundColor = '#FF6B00 !important';
  botao.style.color = '#FFFFFF !important';
  botao.style.border = 'none';

  // Restaurar o estilo do span
  const span = botao.querySelector('span');
  if (span) {
    span.style.backgroundColor = 'rgba(255, 255, 255, 0.2) !important';
  }
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

  permitirSomenteNumeros(event: KeyboardEvent) {
    // Permite: números, backspace, delete, setas, tab, home, end
    if (
      (event.key >= '0' && event.key <= '9') ||
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(event.key)
    ) {
      return;
    } else {
      event.preventDefault();
    }
  }

  formatarTelefone() {
    let numeros = this.telefone.replace(/\D/g, '').substring(0, 11);

    if (numeros.length > 6) {
      this.telefone = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
    } else if (numeros.length > 2) {
      this.telefone = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}`;
    } else if (numeros.length > 0) {
      this.telefone = `(${numeros}`;
    }
  }

  telefoneValido(): boolean {
    // Aceita formato (00) 00000-0000
    return /^\(\d{2}\) \d{5}-\d{4}$/.test(this.telefone);
  }

  enviarParaWhatsApp() {
    const numeroDestino = '5531988664718'; // Substitua pelo número desejado
    const mensagem = encodeURIComponent(
      `Olá! Quero solicitar um orçamento.\n` +
      `Nome: ${this.nome}\n` +
      `E-mail: ${this.email}\n`
    );
    window.open(`https://wa.me/${numeroDestino}?text=${mensagem}`, '_blank');
  }
}

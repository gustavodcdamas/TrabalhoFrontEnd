import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-quarta-secao-servicos-individuais',
  templateUrl: './quarta-secao-servicos-individuais.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./quarta-secao-servicos-individuais.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class QuartaSecaoServicosIndividuaisComponent implements OnInit {
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

  ngOnInit(): void {}

  // Navegação do formulário de briefing
  avancaEtapa(etapa: number): void {
    if (etapa >= 1 && etapa <= 5) { // Verifica se a etapa está dentro do intervalo válido
      this.activeStep = etapa;
    }
  }

  voltaEtapa(etapa: number): void {
    if (etapa >= 1 && etapa <= 5) { // Verifica se a etapa está dentro do intervalo válido
      this.activeStep = etapa;
    }
  }

  // Alternar seleção de um elemento (por evento)
  toggleSelecaoPorEvento(event: Event): void {
    const elemento = event.target as HTMLElement; // Converte o target para HTMLElement
    if (elemento && elemento.classList.contains('form-option')) {
      elemento.classList.toggle('selected'); // Alterna a classe 'selected'
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

  tiposPagina: string[] = ['Institucional', 'Blog', 'Portfólio', 'Loja Virtual', 'Landing Page', 'Outros'];
  selectedTiposPagina: string[] = [];
  outrosTipo: string = '';

  toggleSelecao(tipo: string) {
    if (this.selectedTiposPagina.includes(tipo)) {
      this.selectedTiposPagina = this.selectedTiposPagina.filter(t => t !== tipo);
      if (tipo === 'Outros') this.outrosTipo = '';
    } else {
      this.selectedTiposPagina.push(tipo);
    }
  }

  isSelecionado(tipo: string): boolean {
    return this.selectedTiposPagina.includes(tipo);
  }

  frequenciasAtualizacao = ['Diariamente', 'Semanalmente', 'Mensalmente'];
  frequenciaSelecionada: string | null = null;

  selecionaFrequencia(freq: string) {
    this.frequenciaSelecionada = freq;
  }

  isFrequenciaSelecionada(freq: string): boolean {
    return this.frequenciaSelecionada === freq;
  }

  demandas = ['Marketing', 'Design', 'Social Media', 'Dev Web'];
  demandasSelecionadas: string[] = [];

  toggleDemanda(demanda: string) {
    const idx = this.demandasSelecionadas.indexOf(demanda);
    if (idx > -1) {
      this.demandasSelecionadas.splice(idx, 1);
    } else {
      this.demandasSelecionadas.push(demanda);
    }
  }

  isDemandaSelecionada(demanda: string): boolean {
    return this.demandasSelecionadas.includes(demanda);
  }

  identidadeVisualOpcoes = ['Sim', 'Não'];
  identidadeVisualSelecionada: string | null = null;

  selecionaIdentidadeVisual(opcao: string) {
    this.identidadeVisualSelecionada = opcao;
  }

  isIdentidadeVisualSelecionada(opcao: string): boolean {
    return this.identidadeVisualSelecionada === opcao;
  }

  nomeFinal = '';
  telefoneFinal = '';
  emailFinal = '';

  telefoneValido(): boolean {
    // Aceita formato (00) 00000-0000
    return /^\(\d{2}\) \d{5}-\d{4}$/.test(this.telefoneFinal);
  }

  // ...existing code...

  formatarTelefone() {
    // Remove tudo que não for número
    let numeros = this.telefoneFinal.replace(/\D/g, '');

    // Limita a 11 dígitos
    numeros = numeros.substring(0, 11);

    // Aplica a máscara (00) 00000-0000
    if (numeros.length > 6) {
      this.telefoneFinal = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
    } else if (numeros.length > 2) {
      this.telefoneFinal = `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}`;
    } else if (numeros.length > 0) {
      this.telefoneFinal = `(${numeros}`;
    }
  }

  emailValido(): boolean {
    // Regex simples para validar e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailFinal);
  }

  formatarEmail() {
    // Aqui você pode adicionar lógica extra se quiser tratar espaços ou caracteres inválidos automaticamente
    this.emailFinal = this.emailFinal.trim();
  }

  mensagemSucesso = '';

  moedaSelecionada = 'BRL';
  faturamentoMensalStr = '';
  faturamentoMensal: number | null = null;

  formatarFaturamento() {
    // Remove tudo que não for número
    let numeros = this.faturamentoMensalStr.replace(/\D/g, '');

    // Limita a 29 dígitos
    numeros = numeros.substring(0, 29);

    // Converte para número e divide por 100 para ter centavos
    const valor = Number(numeros) / 100;

    // Atualiza o valor numérico
    this.faturamentoMensal = isNaN(valor) ? null : valor;

    // Formata para moeda
    let locale = 'pt-BR';
    let currency = 'BRL';
    if (this.moedaSelecionada === 'USD') {
      locale = 'en-US';
      currency = 'USD';
    } else if (this.moedaSelecionada === 'EUR') {
      locale = 'de-DE';
      currency = 'EUR';
    }
    this.faturamentoMensalStr = this.faturamentoMensal !== null
      ? this.faturamentoMensal.toLocaleString(locale, { style: 'currency', currency })
      : '';
  }

  faturamentoValido(): boolean {
    return typeof this.faturamentoMensal === 'number' && this.faturamentoMensal >= 0;
  }

  enviarFormulario() {
    const templateParams = {
      nome: this.nomeFinal,
      telefone: this.telefoneFinal,
      email: this.emailFinal,
      tiposPagina: this.selectedTiposPagina?.join(', '),
      frequencia: this.frequenciaSelecionada,
      demandas: this.demandasSelecionadas?.join(', '),
      identidadeVisual: this.identidadeVisualSelecionada,
      // Adicione outros campos conforme necessário
    };
// Envio do e-mail teria que usar + api
    emailjs.send(
      'SEU_SERVICE_ID',      // Substitua pelo seu Service ID
      'SEU_TEMPLATE_ID',     // Substitua pelo seu Template ID
      templateParams,
      'SEU_USER_ID'          // Substitua pelo seu User ID (public key)
    ).then(
      (response) => {
        this.mensagemSucesso = 'Mensagem enviada com sucesso!';
        this.resetarFormulario();
        this.activeStep = 1;
        setTimeout(() => this.mensagemSucesso = '', 4000); // Esconde após 4s
      },
      (error) => {
        alert('Erro ao enviar formulário. Tente novamente.');
      }
    );
  }

  enviarViaWhatsApp() {
    const numeroDestino = '5531988664718'; // Coloque o número com DDI e DDD, só números
    const mensagem = encodeURIComponent(
      `Novo orçamento:\n` +
      `Nome: ${this.nomeFinal}\n` +
      `Telefone: ${this.telefoneFinal}\n` +
      `E-mail: ${this.emailFinal}\n` +
      `Faturamento mensal: ${this.faturamentoMensalStr}\n` +
      `Moeda: ${this.moedaSelecionada}\n` +
      `Tipos de página: ${this.selectedTiposPagina?.join(', ') || '-'}\n` +
      `Frequência de atualização: ${this.frequenciaSelecionada || '-'}\n` +
      `Demandas: ${this.demandasSelecionadas?.join(', ') || '-'}\n` +
      `Identidade Visual: ${this.identidadeVisualSelecionada || '-'}\n`
    );
    window.open(`https://wa.me/${numeroDestino}?text=${mensagem}`, '_blank');
  }

  resetarFormulario() {
    this.nomeFinal = '';
    this.telefoneFinal = '';
    this.emailFinal = '';
    this.selectedTiposPagina = [];
    this.frequenciaSelecionada = null;
    this.demandasSelecionadas = [];
    this.identidadeVisualSelecionada = null;
    // Limpe outros campos se necessário
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

  opcaoSelecionada: string | null = null;

  selecionarOpcao(opcao: string) {
    this.opcaoSelecionada = opcao;
  }
}


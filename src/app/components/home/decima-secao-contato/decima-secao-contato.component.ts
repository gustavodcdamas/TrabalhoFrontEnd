import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-decima-secao-contato',
  templateUrl: './decima-secao-contato.component.html',
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent, FontAwesomeModule],
  styleUrls: ['./decima-secao-contato.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DecimaSecaoContatoComponent {

  constructor(library: FaIconLibrary) {
    library.addIcons(faFacebook, faLinkedinIn, faInstagram, faWhatsapp );
  }

  hoverIcon(event: MouseEvent, hover: boolean) {
    const path = (event.currentTarget as HTMLElement).querySelector('path');
    if (path) {
      path.setAttribute('fill', hover ? '#FFFFFF' : '#1D1D1F');
    }
  }

  nome: string = '';
  email: string = '';
  telefone: string = '';
  mensagem: string = '';

  emailValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  telefoneValido(): boolean {
    // Não aceita letras e valida formato (00) 00000-0000 ou (00) 0000-0000
    const apenasNumeros = this.telefone.replace(/\D/g, '');
    const contemLetras = /[a-zA-Z]/.test(this.telefone);
    return !contemLetras && /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(this.telefone) && apenasNumeros.length >= 10;
  }

   formatarTelefone() {
    let tel = this.telefone.replace(/\D/g, '');
    if (tel.length > 11) tel = tel.slice(0, 11);
    if (tel.length > 6) {
      this.telefone = `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    } else if (tel.length > 2) {
      this.telefone = `(${tel.slice(0, 2)}) ${tel.slice(2)}`;
    } else if (tel.length > 0) {
      this.telefone = `(${tel}`;
    } else {
      this.telefone = '';
    }
  }

  enviarViaWhatsApp() {
    if (!this.emailValido() || !this.telefoneValido()) return;

    const texto =
      `Nome: ${this.nome}\n` +
      `E-mail: ${this.email}\n` +

      `Mensagem: ${this.mensagem}`;

    const url = `https://wa.me/5531988664718?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}

import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule, FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FooterComponent {
  isHomePage: boolean = false;
  activeSection: string = '';

  hoverIcon(event: MouseEvent, hover: boolean) {
    const path = (event.currentTarget as HTMLElement).querySelector('path');
    if (path) {
      path.setAttribute('fill', hover ? '#FFFFFF' : '#1D1D1F');
    }
  }

  constructor(public router: Router,
    library: FaIconLibrary,
    public authService: AuthService
  ) {
    // Detectar quando estamos na página inicial
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.url === '/' || event.url === '';

      // Rolar para o topo quando houver navegação entre páginas
      window.scrollTo(0, 0);
    });

    // Verificar na inicialização
    this.isHomePage = this.router.url === '/' || this.router.url === '';

    
    library.addIcons(faFacebook, faLinkedinIn, faInstagram, faAngular, faWhatsapp );
    library: FaIconLibrary;
  }

  // Detectar qual seção está visível conforme o usuário rola a página
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isHomePage) return;

    const sections = ['projetos', 'contato', 'sobre-nos'];

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Se o elemento estiver visível na viewport
        if (rect.top <= 150 && rect.bottom >= 150) {
          this.activeSection = section;
          break;
        }
      }
    }
  }
}

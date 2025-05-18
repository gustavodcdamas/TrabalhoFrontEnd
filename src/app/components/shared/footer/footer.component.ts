import { Component, HostListener } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  isHomePage: boolean = false;
  activeSection: string = '';

  constructor(public router: Router) {
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

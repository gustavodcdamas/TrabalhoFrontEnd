import { ChangeDetectionStrategy, Component, HostListener, Input, NgModule } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { StickyHeaderDirective } from './sticky-header.directive';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, StickyHeaderDirective],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent {

  isHomePage: boolean = false;
  activeSection: string = '';
  //@Input() isLoggedIn: boolean | null = null;
  isLoggedIn: boolean = false;

  constructor(public router: Router, private authService: AuthService) {
    // Detectar quando estamos na página inicial
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.url === '/' || event.url === '';
    });

    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = this.authService.isLoggedIn();
    });

    // Verificar na inicialização
    this.isHomePage = this.router.url === '/' || this.router.url === '';
  }

  // Método para navegar para a seção de contato de forma condicional
  navegarParaContato(event: Event): void {
    event.preventDefault();

    if (this.isHomePage) {
      // Se estiver na página inicial, role para a seção de contato
      this.scrollToSection(event, 'contato');
    } else {
      // Se não estiver na página inicial, navegue para a página de contato
      this.router.navigate(['/contato']);
    }
  }

  // Método genérico para rolar para qualquer seção na página inicial
  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();

    if (this.isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        this.activeSection = sectionId;
      }
    } else {
      // Se não estiver na página inicial, navegar para a página inicial e depois para a seção
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.activeSection = sectionId;
          }
        }, 300); // Pequeno delay para garantir que a página inicial carregue
      });
    }
  }

  checkAuthState(): void {
    console.log('Estado de autenticação:', {
      isLoggedIn: this.authService.isLoggedIn(),
      currentUser: this.authService.currentUserValue,
      localStorage: localStorage.getItem('currentUser')
    });
  }

  // Detectar qual seção está visível conforme o usuário rola a página
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isHomePage) return;

    const sections = ['projetos', 'contato']; // Adicione todas as seções que você tem

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

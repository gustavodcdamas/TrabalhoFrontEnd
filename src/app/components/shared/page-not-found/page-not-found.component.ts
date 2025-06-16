import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngular, faFacebook, faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-page-not-found',
  imports: [ FontAwesomeModule, HeaderComponent, FooterComponent ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})

export class PageNotFoundComponent {
  constructor(library: FaIconLibrary) {
    library.addIcons(faFacebook, faLinkedinIn, faInstagram, faWhatsapp );
  }

  hoverIcon(event: MouseEvent, hover: boolean) {
    const path = (event.currentTarget as HTMLElement).querySelector('path');
    if (path) {
      path.setAttribute('fill', hover ? '#FFFFFF' : '#1D1D1F');
    }
  }
}

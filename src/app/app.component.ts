import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebook, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faAngular } from '@fortawesome/free-brands-svg-icons';
import { SwiperModule } from 'swiper/angular';
import { FooterComponent } from './components/shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FontAwesomeModule, SwiperModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'agencia-frontend';
  constructor(library: FaIconLibrary) {
    library.addIcons(faFacebook, faLinkedinIn, faInstagram, faAngular );
  }
}

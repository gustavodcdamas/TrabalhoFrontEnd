import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-sobre-nos',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './sobre-nos.component.html',
  styleUrls: ['./sobre-nos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SobreNosComponent {

}

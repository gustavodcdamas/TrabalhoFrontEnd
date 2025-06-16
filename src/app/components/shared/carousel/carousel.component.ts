import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-carousel',
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CarouselComponent {

}

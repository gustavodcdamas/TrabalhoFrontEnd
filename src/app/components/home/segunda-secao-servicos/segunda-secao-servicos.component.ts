import { Component } from '@angular/core';

@Component({
  selector: 'app-segunda-secao-servicos',
  imports: [],
  templateUrl: './segunda-secao-servicos.component.html',
  styleUrl: './segunda-secao-servicos.component.css'
})
export class SegundaSecaoServicosComponent {

        // Carrossel de serviços
        servicosGrid: HTMLElement | null = null;
        servicosPosition: number = 0;
        servicosCardWidth: number = 165; // Largura do card + gap

        servicosNavPrev: HTMLElement | null = null;
        servicosNavNext: HTMLElement | null = null;

        ngOnInit(): void {
            this.servicosGrid = document.querySelector('.services-grid');
            this.servicosNavPrev = document.querySelector('.services-nav-button.prev');
            this.servicosNavNext = document.querySelector('.services-nav-button.next');

            if (this.servicosNavPrev && this.servicosNavNext && this.servicosGrid) {
                this.servicosNavPrev.addEventListener('click', () => {
                    this.servicosPosition += this.servicosCardWidth * 3;
                    if (this.servicosPosition > 0) this.servicosPosition = 0;
                    this.servicosGrid!.style.transform = `translateX(${this.servicosPosition}px)`;
                });

                this.servicosNavNext.addEventListener('click', () => {
                    const maxPosition = -(this.servicosGrid!.scrollWidth - this.servicosGrid!.clientWidth);
                    this.servicosPosition -= this.servicosCardWidth * 3;
                    if (this.servicosPosition < maxPosition) this.servicosPosition = maxPosition;
                    this.servicosGrid!.style.transform = `translateX(${this.servicosPosition}px)`;
                });
            }
        }

}

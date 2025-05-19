import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terceira-secao-portfolio',
  templateUrl: './terceira-secao-portfolio.component.html',
  imports: [CommonModule],
  styleUrls: ['./terceira-secao-portfolio.component.css']
})
export class TerceiraSecaoPortfolioComponent implements OnInit {
  portfolioItems = [
    { image: 'projeto1.png' },
    { image: 'projeto 1.png' },
    { image: 'projeto 2.png' },
    { image: 'projeto 3.png' },
    { image: 'projeto 4.png' },
    { image: 'projeto 5.png' },
    { image: 'projeto 6.png' },
    { image: 'projeto 7.png' },
    { image: 'projeto 8.png' },
    { image: 'projeto 9.png' },
    { image: 'projeto 10.png' },
    { image: 'projeto 11.png' },
    { image: 'projeto 12.png' },
  ];

  portfolioPosition = 0;
  itemsPerSlide = 1;  // Número de itens visíveis por vez (4 imagens)
  totalSlides = 0;
  activeIndex = 0;

  ngOnInit(): void {
    // Calcula o número total de slides, com base no total de itens e na quantidade de itens por slide
    this.totalSlides = Math.ceil(this.portfolioItems.length / this.itemsPerSlide); // 12 imagens / 4 imagens por vez = 3 slides
  }

  goToSlide(index: number): void {
    this.activeIndex = index;
    // Atualiza a posição do carrossel com base no índice atual
    this.portfolioPosition = -(index * this.itemsPerSlide * 100) / this.portfolioItems.length * 100; // Corrige o deslocamento
  }

  prevSlide(): void {
    this.activeIndex = Math.max(this.activeIndex - 1, 0); // Evita ir para um índice negativo
    this.portfolioPosition = -(this.activeIndex * this.itemsPerSlide * 100) / this.portfolioItems.length * 100; // Corrige o deslocamento
  }

  nextSlide(): void {
    this.activeIndex = Math.min(this.activeIndex + 1, this.totalSlides - 1); // Evita ir além do número de slides
    this.portfolioPosition = -(this.activeIndex * this.itemsPerSlide * 100) / this.portfolioItems.length * 100; // Corrige o deslocamento
  }

  get indicators(): number[] {
    return Array(this.totalSlides).fill(0).map((_, index) => index);
  }
}

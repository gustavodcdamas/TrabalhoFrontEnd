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
    { title: 'Projeto 1', description: 'Descrição do projeto 1', image: 'image1.jpg' },
    { title: 'Projeto 2', description: 'Descrição do projeto 2', image: 'image2.jpg' },
    { title: 'Projeto 3', description: 'Descrição do projeto 3', image: 'image3.jpg' },
    { title: 'Projeto 4', description: 'Descrição do projeto 4', image: 'image4.jpg' },
    { title: 'Projeto 5', description: 'Descrição do projeto 5', image: 'image5.jpg' },
    { title: 'Projeto 6', description: 'Descrição do projeto 6', image: 'image6.jpg' }
  ];
  portfolioPosition = 0;
  itemWidth = 320; // Largura do item + gap
  totalSlides = 0;
  activeIndex = 0;

  ngOnInit(): void {
    this.totalSlides = Math.ceil(this.portfolioItems.length / 3);
  }

  goToSlide(index: number): void {
    this.activeIndex = index;
    this.portfolioPosition = -index * this.itemWidth * 3;
  }

  prevSlide(): void {
    this.activeIndex = Math.max(this.activeIndex - 1, 0);
    this.portfolioPosition = -this.activeIndex * this.itemWidth * 3;
  }

  nextSlide(): void {
    this.activeIndex = Math.min(this.activeIndex + 1, this.totalSlides - 1);
    this.portfolioPosition = -this.activeIndex * this.itemWidth * 3;
  }

  get indicators(): number[] {
    return Array(this.totalSlides).fill(0).map((_, index) => index);
  }
}

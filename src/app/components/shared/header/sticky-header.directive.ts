// sticky-header.directive.ts
import { Directive, HostListener, HostBinding, Renderer2, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appStickyHeader]'
})
export class StickyHeaderDirective implements OnInit {
  private isSticky = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Garante que o header tenha um fundo sólido
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#EDEDED');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const shouldBeSticky = scrollPosition > 10;
    
    if (shouldBeSticky !== this.isSticky) {
      this.isSticky = shouldBeSticky;
      if (this.isSticky) {
        this.renderer.addClass(this.el.nativeElement, 'sticky');
        this.renderer.addClass(document.body, 'sticky-header-padding');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'sticky');
        this.renderer.removeClass(document.body, 'sticky-header-padding');
      }
    }
  }
}
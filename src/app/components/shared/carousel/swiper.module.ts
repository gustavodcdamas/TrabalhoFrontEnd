import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperModule, SwiperComponent } from 'swiper/angular';

@NgModule({
  imports: [CommonModule, SwiperModule],
  exports: [SwiperModule]
})
export class SwiperCustomModule {}
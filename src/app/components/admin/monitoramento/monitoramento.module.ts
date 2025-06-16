import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MonitoringService } from 'src/app/services/monitoramento/monitoramento.service';
import { MonitoringComponent } from './monitoramento.component';

@NgModule({
  declarations: [
    MonitoringComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: MonitoringComponent
      }
    ])
  ],
  providers: [
    MonitoringService
  ]
})
export class MonitoringModule { }
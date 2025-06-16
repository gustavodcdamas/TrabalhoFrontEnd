import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetimaSecaoBeneficiosComponent } from './setima-secao-beneficios.component';

describe('SetimaSecaoBeneficiosComponent', () => {
  let component: SetimaSecaoBeneficiosComponent;
  let fixture: ComponentFixture<SetimaSecaoBeneficiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetimaSecaoBeneficiosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetimaSecaoBeneficiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

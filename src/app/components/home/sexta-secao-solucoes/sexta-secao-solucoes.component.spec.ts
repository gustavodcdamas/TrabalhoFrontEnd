import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SextaSecaoSolucoesComponent } from './sexta-secao-solucoes.component';

describe('SextaSecaoSolucoesComponent', () => {
  let component: SextaSecaoSolucoesComponent;
  let fixture: ComponentFixture<SextaSecaoSolucoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SextaSecaoSolucoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SextaSecaoSolucoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

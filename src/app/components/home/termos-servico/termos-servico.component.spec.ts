import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermosServicoComponent } from './termos-servico.component';

describe('TermosServicoComponent', () => {
  let component: TermosServicoComponent;
  let fixture: ComponentFixture<TermosServicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermosServicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermosServicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartaSecaoServicosIndividuaisComponent } from './quarta-secao-servicos-individuais.component';

describe('QuartaSecaoServicosIndividuaisComponent', () => {
  let component: QuartaSecaoServicosIndividuaisComponent;
  let fixture: ComponentFixture<QuartaSecaoServicosIndividuaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuartaSecaoServicosIndividuaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuartaSecaoServicosIndividuaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

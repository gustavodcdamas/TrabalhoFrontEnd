import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuintaSecaoPacotesComponent } from './quinta-secao-pacotes.component';

describe('QuintaSecaoPacotesComponent', () => {
  let component: QuintaSecaoPacotesComponent;
  let fixture: ComponentFixture<QuintaSecaoPacotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuintaSecaoPacotesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuintaSecaoPacotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

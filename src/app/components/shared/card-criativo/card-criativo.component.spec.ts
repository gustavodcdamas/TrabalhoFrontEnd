import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCriativoComponent } from './card-criativo.component';

describe('CardCriativoComponent', () => {
  let component: CardCriativoComponent;
  let fixture: ComponentFixture<CardCriativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCriativoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCriativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

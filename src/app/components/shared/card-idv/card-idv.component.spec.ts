import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardIdvComponent } from './card-idv.component';

describe('CardIdvComponent', () => {
  let component: CardIdvComponent;
  let fixture: ComponentFixture<CardIdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardIdvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardIdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

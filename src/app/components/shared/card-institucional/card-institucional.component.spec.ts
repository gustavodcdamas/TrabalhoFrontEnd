import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardInstitucionalComponent } from './card-institucional.component';

describe('CardInstitucionalComponent', () => {
  let component: CardInstitucionalComponent;
  let fixture: ComponentFixture<CardInstitucionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardInstitucionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardInstitucionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

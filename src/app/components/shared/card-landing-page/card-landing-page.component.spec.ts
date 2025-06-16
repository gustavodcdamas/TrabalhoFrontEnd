import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLandingPageComponent } from './card-landing-page.component';

describe('CardLandingPageComponent', () => {
  let component: CardLandingPageComponent;
  let fixture: ComponentFixture<CardLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLandingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

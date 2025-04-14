import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerceiraSecaoPortfolioComponent } from './terceira-secao-portfolio.component';

describe('TerceiraSecaoPortfolioComponent', () => {
  let component: TerceiraSecaoPortfolioComponent;
  let fixture: ComponentFixture<TerceiraSecaoPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerceiraSecaoPortfolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerceiraSecaoPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

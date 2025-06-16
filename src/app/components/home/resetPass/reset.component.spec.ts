import { ComponentFixture, TestBed } from '@angular/core/testing';

import { resetComponent } from './reset.component';

describe('resetComponent', () => {
  let component: resetComponent;
  let fixture: ComponentFixture<resetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [resetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(resetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

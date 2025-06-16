import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdvsComponent } from './idvs.component';

describe('IdvsComponent', () => {
  let component: IdvsComponent;
  let fixture: ComponentFixture<IdvsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdvsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

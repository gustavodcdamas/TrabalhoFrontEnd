import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIdvComponent } from './admin-idv.component';

describe('AdminIdvComponent', () => {
  let component: AdminIdvComponent;
  let fixture: ComponentFixture<AdminIdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIdvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
